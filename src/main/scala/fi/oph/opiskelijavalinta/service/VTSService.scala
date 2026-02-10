package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.{JsonSetter, Nulls}
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.ValintaTulosServiceClient
import fi.oph.opiskelijavalinta.model.{HakemuksenTulos, HakemuksenTulosRaw, HakutoiveenTulos, HakutoiveenTulosEnriched}
import fi.oph.opiskelijavalinta.util.TranslationUtil
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

enum AllowedIlmoittautumisTila:
  case LASNA_KOKO_LUKUVUOSI, LASNA_KEVAT

case class IlmoittautuminenRequestBody(hakukohdeOid: String, tila: String, muokkaaja: String, selite: String)

@Service
class VTSService @Autowired (
  vtsClient: ValintaTulosServiceClient,
  koodistoService: KoodistoService,
  mapper: ObjectMapper = new ObjectMapper()
) {

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper
    .configOverride(classOf[List[_]])
    .setSetterInfo(JsonSetter.Value.forValueNulls(Nulls.AS_EMPTY))

  private val LOG: Logger = LoggerFactory.getLogger(classOf[KoutaService]);

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
      None
    )
  }

  def getValinnanTulokset(hakuOid: String, hakemusOid: String): Option[HakemuksenTulos] = {
    vtsClient.getValinnanTulokset(hakuOid, hakemusOid) match {
      case Left(e) =>
        LOG.error(
          s"Failed to fetch valinnantulos data for hakuOid=$hakuOid, hakemusOid=$hakemusOid: ${e.getMessage}"
        )
        Option.empty
      case Right(o) =>
        val raw                         = mapper.readValue(o, classOf[HakemuksenTulosRaw])
        val enrichedHakutoiveenTulokset =
          raw.hakutoiveet
            .filter(_.julkaistavissa.getOrElse(false))
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

  def doVastaanotto(hakemusOid: String, hakukohdeOid: String, vastaanotto: String): Option[String] = {
    vtsClient.postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto) match {
      case Left(e) =>
        LOG.error(s"Failed to do vastaanotto for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
        throw RuntimeException(s"Failed to do vastaanotto for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
      case Right(o) => Option.apply(o)
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
        LOG.error(s"Failed to do ilmoittautuminen for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
        throw RuntimeException(s"Failed to do ilmoittautuminen for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
      case Right(o) => Option.apply(o)
    }
  }

}
