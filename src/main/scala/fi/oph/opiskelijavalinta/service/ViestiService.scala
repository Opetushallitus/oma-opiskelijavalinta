package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.Constants.OPH_ORGANISAATIO_OID
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import fi.oph.viestinvalitys.ViestinvalitysClient
import fi.oph.viestinvalitys.vastaanotto.model.ViestinvalitysBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Qualifier}
import org.springframework.stereotype.Service

import java.time.LocalDateTime
import java.util.Optional

@Service
class ViestiService @Autowired (
  hakemuksetService: HakemuksetService,
  koutaService: KoutaService,
  lokalisointiService: LokalisointiService,
  authorizationService: AuthorizationService,
  @Autowired @Qualifier("viestinValitysClient") viestinvalitysClient: ViestinvalitysClient
) {

  private val OPH_PAAKAYTTAJA      = "APP_VIESTINVALITYS_OPH_PAAKAYTTAJA"
  private val VIESTIN_SAILYTYSAIKA = 365

  private val LOGGER: Logger = LoggerFactory.getLogger(classOf[ViestiService]);

  def lahetaVastaanottoViesti(
    hakukohdeOid: String,
    hakemusOid: String,
    hakuOid: String,
    vastaanottoKaannosAvain: String
  ): Unit = {
    val oppijanumero  = authorizationService.getPersonOid.get
    val (email, lang) = hakemuksetService.getHakemusEmailAndLang(oppijanumero, hakemusOid)
    val asiointikieli = SupportedLanguage.valueOf(lang)
    LOGGER.info(
      s"Lähetetään vastaanottoviesti: hakemusOid $hakemusOid, hakukohdeOid $hakukohdeOid, vastaanotto: $vastaanottoKaannosAvain"
    )
    try {
      val haku            = koutaService.getHaku(hakuOid)
      val hakutoive       = koutaService.getHakukohde(hakukohdeOid)
      val otsikko         = lokalisointiService.getTranslation(asiointikieli, "vastaanottoviesti.otsikko")
      val vastaanottaneet = lokalisointiService.getTranslationWithParams(
        asiointikieli,
        "vastaanottoviesti.viesti.olemme-vastaanottaneet",
        Map("aikaleima" -> LocalDateTime.now)
      )
      val vastaanotto = lokalisointiService.getTranslation(asiointikieli, vastaanottoKaannosAvain)
      val vastaus     = lokalisointiService.getTranslationWithParams(
        asiointikieli,
        "vastaanottoviesti.viesti.vastaanottanut",
        Map(
          "vastaus"   -> vastaanotto,
          "paikka"    -> hakutoive.get.jarjestyspaikkaHierarkiaNimi,
          "hakutoive" -> hakutoive.get.nimi
        )
      )
      val haunNimi = lokalisointiService.getTranslationWithParams(
        asiointikieli,
        "vastaanottoviesti.viesti.haku",
        Map("haku" -> haku.get.nimi)
      )
      val alaVastaa = lokalisointiService.getTranslation(asiointikieli, "vastaanottoviesti.viesti.ala-vastaa")
      val sisalto   =
        Array(vastaanottaneet, vastaus, haunNimi, alaVastaa).reduceLeft((a, b) => a.concat("<br />").concat(b))

      viestinvalitysClient.luoViesti(
        ViestinvalitysBuilder
          .viestiBuilder()
          .withOtsikko(otsikko)
          .withHtmlSisalto(sisalto)
          .withKielet(lang)
          .withVastaanottajat(
            ViestinvalitysBuilder
              .vastaanottajatBuilder()
              .withVastaanottaja(Optional.empty, email)
              .build()
          )
          .withKayttooikeusRajoitukset(
            ViestinvalitysBuilder
              .kayttooikeusrajoituksetBuilder()
              .withKayttooikeus(OPH_PAAKAYTTAJA, OPH_ORGANISAATIO_OID)
              .build()
          )
          .withLahettavaPalvelu("oma-opiskelijavalinta")
          .withNormaaliPrioriteetti()
          .withLahettaja(Optional.empty(), "noreply@opintopolku.fi")
          .withSailytysAika(VIESTIN_SAILYTYSAIKA)
          .build()
      )
    } catch {
      case e: Exception =>
        LOGGER.error(s"Vastaanottosähköpostin lähetys epäonnistui: hakukohdeOid: $hakukohdeOid, email $email", e)
        throw RuntimeException("Vastaanottosähköpostin lähetys epäonnistui")
    }
  }

}
