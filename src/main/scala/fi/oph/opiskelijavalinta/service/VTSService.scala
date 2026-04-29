package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.{JsonSetter, Nulls}
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.{ValintaTulosServiceClient, VtsBadRequestException}
import fi.oph.opiskelijavalinta.model.{
  HakemuksenTulos,
  HakemuksenTulosRaw,
  HakutoiveenTulos,
  HakutoiveenTulosEnriched,
  Ilmoittautumistapa,
  Ilmoittautumistila
}
import fi.oph.opiskelijavalinta.security.{MigriJsonWebToken, OiliJsonWebToken}
import fi.oph.opiskelijavalinta.util.TranslationUtil
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

enum AllowedIlmoittautumisTila:
  case LASNA_KOKO_LUKUVUOSI, LASNA

enum AllowedVastaanottoTilaToiminto:
  case Peru, VastaanotaSitovasti, VastaanotaSitovastiPeruAlemmat, VastaanotaEhdollisesti

case class IlmoittautuminenRequestBody(hakukohdeOid: String, tila: String, muokkaaja: String, selite: String)

@Service
class VTSService @Autowired (
  vtsClient: ValintaTulosServiceClient,
  koodistoService: KoodistoService,
  migriToken: MigriJsonWebToken,
  oiliToken: OiliJsonWebToken,
  mapper: ObjectMapper = new ObjectMapper()
) {

  @Value("${migri.url}")
  val migriUrl: String = null

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper
    .configOverride(classOf[List[_]])
    .setSetterInfo(JsonSetter.Value.forValueNulls(Nulls.AS_EMPTY))

  private val LOG: Logger = LoggerFactory.getLogger(classOf[VTSService]);

  private val MUU_KOODI = "muu"

  private def enrichHakutoiveenTulos(
    tulos: HakutoiveenTulos
  ): HakutoiveenTulosEnriched = {
    val hyvaksymisenEhto =
      if (!tulos.ehdollisestiHyvaksyttavissa.contains(true)) {
        None
      } else {
        tulos.ehdollisenHyvaksymisenEhtoKoodi match {
          case Some(koodi) if koodi != MUU_KOODI =>
            koodistoService
              .getKooditForKoodisto("hyvaksynnanehdot")
              .find(_.koodiArvo == koodi)
              .map(_.toTranslatedName)
              .orElse(TranslationUtil.inlineHyvaksymisenEhto(tulos))

          case _ =>
            TranslationUtil.inlineHyvaksymisenEhto(tulos)
        }
      }

    HakutoiveenTulosEnriched(
      hakukohdeOid = tulos.hakukohdeOid,
      hakukohdeNimi = tulos.hakukohdeNimi,
      tarjoajaOid = tulos.tarjoajaOid,
      tarjoajaNimi = tulos.tarjoajaNimi,
      valintatapajonoOid = tulos.valintatapajonoOid,
      valintatila = tulos.valintatila,
      vastaanottotila = tulos.vastaanottotila,
      ilmoittautumistila = tulos.ilmoittautumistila,
      vastaanotettavuustila = tulos.vastaanotettavuustila,
      vastaanottoDeadline = tulos.vastaanottoDeadline,
      viimeisinHakemuksenTilanMuutos = tulos.viimeisinHakemuksenTilanMuutos,
      hyvaksyttyJaJulkaistuDate = tulos.hyvaksyttyJaJulkaistuDate,
      varasijanumero = tulos.varasijanumero,
      julkaistavissa = tulos.julkaistavissa,
      ehdollisestiHyvaksyttavissa = tulos.ehdollisestiHyvaksyttavissa,
      ehdollisenHyvaksymisenEhto = hyvaksymisenEhto,
      tilanKuvaukset = tulos.tilanKuvaukset,
      showMigriURL = tulos.showMigriURL,
      ilmoittautumisenAikaleima = tulos.ilmoittautumisenAikaleima,
      jonokohtaisetTulostiedot = tulos.jonokohtaisetTulostiedot,
      kelaURL = tulos.kelaURL,
      migriURL = if (tulos.showMigriURL.getOrElse(false)) Some(migriUrl) else None
    )
  }

  def getValinnanTulokset(hakuOid: String, hakemusOid: String): Option[HakemuksenTulos] = {
    vtsClient.getValinnanTulokset(hakuOid, hakemusOid) match {
      case Left(e) =>
        LOG.error(
          s"Virhe valinnan tuloksien hakemisessa, hakuOid=$hakuOid, hakemusOid=$hakemusOid: ${e.getMessage}"
        )
        Option.empty
      case Right(o) =>
        val raw                         = mapper.readValue(o, classOf[HakemuksenTulosRaw])
        val enrichedHakutoiveenTulokset =
          raw.hakutoiveet
            .map(enrichHakutoiveenTulos)
        Some(
          HakemuksenTulos(
            hakuOid = raw.hakuOid,
            hakemusOid = raw.hakemusOid,
            hakijaOid = raw.hakijaOid,
            hakutoiveet = enrichedHakutoiveenTulokset
          )
        )
    }
  }

  def addJwtsForLinkUserIfNecessary(hakijaOid: String, tulos: HakutoiveenTulosEnriched): HakutoiveenTulosEnriched = {
    val migriUrlWithToken: Option[String] = if (tulos.showMigriURL.getOrElse(false)) {
      Some(s"${migriUrl}?token=${migriToken.createMigriJWT(hakijaOid)}")
    } else None
    val ilmoittautumisTila: Option[Ilmoittautumistila] = tulos.ilmoittautumistila.map(it => {
      if (it.ilmoittauduttavissa.getOrElse(false) && it.ilmoittautumistapa.flatMap(it => it.url).isDefined) {
        val ilmoittautumisTapa = Some(
          Ilmoittautumistapa(
            it.ilmoittautumistapa.flatMap(tapa => tapa.nimi),
            it.ilmoittautumistapa.map(tapa => s"${tapa.url.getOrElse("")}?token=${oiliToken.createOiliJWT(hakijaOid)}")
          )
        )
        it.copy(ilmoittautumistapa = ilmoittautumisTapa)
      } else {
        it
      }
    })
    tulos.copy(
      migriURL = migriUrlWithToken,
      ilmoittautumistila = ilmoittautumisTila
    )
  }

  def doVastaanotto(
    hakemusOid: String,
    hakukohdeOid: String,
    vastaanotto: AllowedVastaanottoTilaToiminto
  ): Option[String] = {
    vtsClient.postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto.toString) match {
      case Left(e: VtsBadRequestException) =>
        LOG.error(s"Virhe vastaanotossa hakemukselle $hakemusOid, hakukohteelle $hakukohdeOid: ${e.getMessage}", e)
        throw e
      case Left(e) =>
        LOG.error(s"Virhe vastaanotossa hakemukselle $hakemusOid, hakukohteelle $hakukohdeOid: ${e.getMessage}", e)
        throw RuntimeException(
          s"Tuntematon virhe vastaanotossa hakemukselle $hakemusOid, hakukohteelle $hakukohdeOid: ${e.getMessage}"
        )
      case Right(o) =>
        Option.apply(o)
    }
  }

  def doIlmoittautuminen(
    oppijanumero: String,
    hakemusOid: String,
    hakukohdeOid: String,
    hakuOid: String,
    ilmoittautumisTila: AllowedIlmoittautumisTila
  ): Option[String] = {
    val requestBody = mapper.writeValueAsString(
      IlmoittautuminenRequestBody(hakukohdeOid, ilmoittautumisTila.toString, oppijanumero, "oma-opiskelijavalinta")
    )
    vtsClient.postIlmoittautuminen(hakemusOid, hakuOid, requestBody) match {
      case Left(e) =>
        LOG.error(s"Virhe ilmoittautumisessa hakemukselle $hakemusOid, hakukohde $hakukohdeOid: ${e.getMessage}", e)
        throw RuntimeException(
          s"Virhe ilmoittautumisessa hakemukselle $hakemusOid, hakukohde $hakukohdeOid: ${e.getMessage}"
        )
      case Right(o) => Option.apply(o)
    }
  }

}
