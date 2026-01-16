package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.vm.sade.javautils.nio.cas.CasClient
import fi.oph.opiskelijavalinta.model.{
  HakemuksetEnriched,
  Hakemus,
  HakemusEnriched,
  Haku,
  HakuEnriched,
  Hakukohde,
  HakutoiveenTulos,
  Ohjausparametrit
}
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import java.text.DateFormat
import scala.concurrent.ExecutionContext.Implicits.global
import java.time.Duration as JavaDuration
import java.util.Date
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

@Service
class HakemuksetService @Autowired (
  ataruClient: AtaruClient,
  koutaService: KoutaService,
  ohjausparametritService: OhjausparametritService,
  VTSService: VTSService,
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
        LOG.error(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
        throw RuntimeException(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
      case Right(o) =>
        val apps     = mapper.readValue(o, classOf[Array[Hakemus]]).toSeq
        val enriched = apps.map(a => enrichHakemus(a))
        HakemuksetEnriched(
          enriched.filter(a => isAjankohtainenHakemus(a.ohjausparametrit)),
          enriched.filter(a => isVanhaHakemus(a.ohjausparametrit))
        )
    }
  }

  def getHakemusOids(oppijanumero: String): List[String] = {
    ataruClient.getHakemukset(oppijanumero) match {
      case Left(e) =>
        LOG.error(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
        throw RuntimeException(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
      case Right(o) =>
        mapper.readValue(o, classOf[Array[Hakemus]]).toList.map(h => h.oid)
    }
  }

  private def isAjankohtainenHakemus(ohjausparametrit: Option[Ohjausparametrit]) = {
    val now = System.currentTimeMillis()
    now < ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)
  }

  private def isVanhaHakemus(ohjausparametrit: Option[Ohjausparametrit]) = {
    val now = System.currentTimeMillis()
    now >= ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)
  }

  private def enrichHakemus(hakemus: Hakemus): HakemusEnriched = {
    val now                                           = new Date()
    var haku: Option[HakuEnriched]                    = Option.empty
    var hakukohteet: List[Option[Hakukohde]]          = List.empty
    var ohjausparametrit: Option[Ohjausparametrit]    = Option.empty
    var hakutoiveidenTulokset: List[HakutoiveenTulos] = List.empty
    if (hakemus.haku != null) {
      haku = koutaService.getHaku(hakemus.haku, hakemus.submitted)
      hakukohteet = hakemus.hakukohteet.map(koutaService.getHakukohde)
      ohjausparametrit = ohjausparametritService
        .getOhjausparametritForHaku(hakemus.haku)
        .map(o =>
          Ohjausparametrit(
            o.PH_HKP.flatMap(d => d.date),
            o.PH_IP.flatMap(d => d.date),
            o.PH_VTJH.flatMap(d => d.date),
            o.PH_EVR.flatMap(d => d.date),
            o.PH_OPVP.flatMap(d => d.date),
            o.PH_VSTP.flatMap(d => d.date),
            o.sijoittelu,
            o.jarjestetytHakutoiveet
          )
        )
      // haetaan tulokset vain ajankohtaisille hakemuksille
      if (isAjankohtainenHakemus(ohjausparametrit)) {
        // VTSService palauttaa vain julkaistavissa olevat hakutoiveen tulokset
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
      hakemus.formName
    )
  }
}
