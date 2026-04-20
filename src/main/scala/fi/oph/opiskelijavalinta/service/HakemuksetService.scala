package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.Constants.KOUTA_HAKU_OID_LENGTH
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.oph.opiskelijavalinta.model.{
  HakemuksetEnriched,
  Hakemus,
  HakemusEnriched,
  Haku,
  HakuEnriched,
  Hakukohde,
  HakutoiveenTulosEnriched,
  Ohjausparametrit
}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

import java.util.Date

@Service
class HakemuksetService @Autowired (
  ataruClient: AtaruClient,
  koutaService: KoutaService,
  ohjausparametritService: OhjausparametritService,
  VTSService: VTSService,
  tuloskirjeService: TuloskirjeService,
  mapper: ObjectMapper = new ObjectMapper()
) {

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuksetService]);

  def getHakemukset(oppijanumero: String): HakemuksetEnriched = {
    ataruClient.getHakemukset(oppijanumero) match {
      case Left(e) =>
        LOG.error(s"Virhe hakemusten hakemisessa henkilölle, personOid $oppijanumero: ${e.getMessage}")
        throw RuntimeException("Hakemuksien haku epäonnistui")
      case Right(o) =>
        val apps     = mapper.readValue(o, classOf[Array[Hakemus]]).toSeq
        val enriched = apps
          .filter(a => a.haku == null || a.haku.isBlank || a.haku.length.equals(KOUTA_HAKU_OID_LENGTH))
          .map(a => enrichHakemus(a))
        HakemuksetEnriched(
          enriched.filter(isAjankohtainenHakemus),
          enriched.filter(isVanhaHakemus)
        )
    }
  }

  def getHakemusOids(oppijanumero: String): List[String] = {
    ataruClient.getHakemukset(oppijanumero) match {
      case Left(e) =>
        LOG.error(s"Virhe hakemus-oidien haussa oppijanumerolla $oppijanumero: ${e.getMessage}", e)
        throw RuntimeException("Hakemusoidien haku oppijanumerolla epäonnistui")
      case Right(o) =>
        mapper.readValue(o, classOf[Array[Hakemus]]).toList.map(h => h.oid)
    }
  }

  def getHakemusEmailAndLang(oppijanumero: String, hakemusOid: String): (String, String) = {
    ataruClient.getHakemukset(oppijanumero) match {
      case Left(e) =>
        LOG.error(
          s"Virhe hakemuksen haussa oppijanumerolla $oppijanumero ja hakemusnumerolla $hakemusOid: ${e.getMessage}",
          e
        )
        throw RuntimeException("Virhe hakemustietojen haussa")

      case Right(o) =>
        val hakemus = mapper
          .readValue(o, classOf[Array[Hakemus]])
          .find(_.oid == hakemusOid)
          .getOrElse(throw RuntimeException(s"Virhe: hakemusta $hakemusOid ei löytynyt"))
        val email = hakemus.email.getOrElse(
          throw RuntimeException(s"Sähköpostiosoite puuttuu hakemukselta $hakemusOid")
        )
        val lang = hakemus.asiointikieli.getOrElse("fi")
        (email, lang)
    }
  }

  private def isAjankohtainenHaullinenHakemus(ohjausparametrit: Option[Ohjausparametrit]) = {
    val now = System.currentTimeMillis()
    now < ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)
  }

  private def isAjankohtainenHakemus(hakemus: HakemusEnriched) = {
    hakemus.haku.isEmpty || isAjankohtainenHaullinenHakemus(hakemus.ohjausparametrit)
  }

  private def isVanhaHakemus(hakemus: HakemusEnriched) = {
    val now = System.currentTimeMillis()
    hakemus.haku.isDefined && now >= hakemus.ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)
  }

  private def enrichHaku(haku: Haku, hakemus: Hakemus): HakuEnriched = {
    HakuEnriched(
      haku.oid,
      haku.nimi,
      hakemus.hakuaikaIsOn.getOrElse(false),
      hakemus.hakuaikaEnds,
      haku.kohdejoukkoKoodiUri,
      haku.hakutapaKoodiUri,
      haku.metadata
        .flatMap(metadata => metadata.koulutuksenAlkamiskausi)
        .flatMap(kak => kak.koulutuksenAlkamiskausi)
        .flatMap(k => k.koodiUri)
    )
  }

  private def enrichHakemus(hakemus: Hakemus): HakemusEnriched = {
    val now                                                   = new Date()
    var haku: Option[HakuEnriched]                            = Option.empty
    var hakukohteet: List[Option[Hakukohde]]                  = List.empty
    var ohjausparametrit: Option[Ohjausparametrit]            = Option.empty
    var hakutoiveidenTulokset: List[HakutoiveenTulosEnriched] = List.empty
    var tuloskirjeModified: Option[Long]                      = Option.empty
    if (hakemus.haku != null) {
      tuloskirjeModified = tuloskirjeService.getLastModifiedTuloskirje(hakemus.haku, hakemus.oid)
      haku = koutaService.getHaku(hakemus.haku).map(h => enrichHaku(h, hakemus))
      hakukohteet = hakemus.hakukohteet.map(koutaService.getHakukohde)
      ohjausparametrit = ohjausparametritService
        .getOhjausparametritForHaku(hakemus.haku)
        .map(o => {
          Ohjausparametrit(
            o.PH_HKP.flatMap(d => d.date),
            o.PH_IP.flatMap(d => d.date),
            o.PH_VTJH.flatMap(d => d.dateStart),
            o.PH_VTJH.flatMap(d => d.dateEnd),
            o.PH_EVR.flatMap(d => d.date),
            o.PH_OPVP.flatMap(d => d.date),
            o.PH_VSTP.flatMap(d => d.date),
            o.sijoittelu,
            o.jarjestetytHakutoiveet
          )
        })
      // haetaan tulokset vain ajankohtaisille hakemuksille
      if (isAjankohtainenHaullinenHakemus(ohjausparametrit)) {
        // luotetaan siihen että VTSService palauttaa vain sellaiset hakutoiveen tulokset jotka voi näyttää
        hakutoiveidenTulokset = VTSService.getValinnanTulokset(hakemus.haku, hakemus.oid) match {
          case Some(v) => v.hakutoiveet
          case _       => List.empty
        }
      }
    }
    HakemusEnriched(
      hakemus.oid,
      haku,
      hakukohteet,
      ohjausparametrit,
      hakemus.secret,
      hakemus.submitted,
      hakutoiveidenTulokset,
      hakemus.processing,
      hakemus.formName,
      tuloskirjeModified
    )
  }
}
