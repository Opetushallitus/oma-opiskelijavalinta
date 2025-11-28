package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.vm.sade.javautils.nio.cas.CasClient
import fi.oph.opiskelijavalinta.model.{
  Application,
  ApplicationEnriched,
  ApplicationsEnriched,
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
class ApplicationsService @Autowired (
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

  private val LOG: Logger = LoggerFactory.getLogger(classOf[ApplicationsService]);

  def getApplications(oppijanumero: String): ApplicationsEnriched = {
    ataruClient.getApplications(oppijanumero) match {
      case Left(e) =>
        LOG.error(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
        throw RuntimeException(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
      case Right(o) =>
        val apps     = mapper.readValue(o, classOf[Array[Application]]).toSeq
        val enriched = apps.map(a => enrichApplication(a))
        val now      = System.currentTimeMillis()
        ApplicationsEnriched(
          enriched.filter(a => isAjankohtainenHakemus(now, a.ohjausparametrit)),
          enriched.filter(a => now >= a.ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)))
    }
  }

  private def isAjankohtainenHakemus(now: Long, ohjausparametrit: Option[Ohjausparametrit]) = {
    now < ohjausparametrit.flatMap(o => o.hakukierrosPaattyy).getOrElse(0L)
  }

  private def isJulkaistuTulosHakutoiveella(tulokset: List[HakutoiveenTulos]): Boolean = {
    tulokset.exists(t => t.julkaistavissa.getOrElse(false))
  }

  private def enrichApplication(application: Application): ApplicationEnriched = {
    val now                                           = new Date()
    var haku: Option[HakuEnriched]                    = Option.empty
    var hakukohteet: Set[Option[Hakukohde]]           = Set.empty
    var ohjausparametrit: Option[Ohjausparametrit]    = Option.empty
    var hakutoiveidenTulokset: List[HakutoiveenTulos] = List.empty
    if (application.haku != null) {
      haku = koutaService.getHaku(application.haku, application.submitted)
      hakukohteet = application.hakukohteet.map(koutaService.getHakukohde)
      ohjausparametrit = ohjausparametritService
        .getOhjausparametritForHaku(application.haku)
        .map(o =>
          Ohjausparametrit(
            o.PH_HKP.flatMap(d => d.date),
            o.PH_IP.flatMap(d => d.date),
            o.PH_VTJH.flatMap(d => d.date),
            o.PH_EVR.flatMap(d => d.date),
            o.PH_OPVP.flatMap(d => d.date),
            o.jarjestetytHakutoiveet
          )
        )
      // haetaan tulokset vain ajankohtaisille hakemuksille
      if(isAjankohtainenHakemus(System.currentTimeMillis(), ohjausparametrit)) {
        // palautetaan tulokset vain jos jollain hakutoiveella on julkaistava tulos
        // tai kesken-tulos kun hakuaika on päättynyt
        hakutoiveidenTulokset = VTSService.getValinnanTulokset(application.haku, application.oid) match {
          case Some(v) =>
            if (!haku.get.hakuaikaKaynnissa || isJulkaistuTulosHakutoiveella(v.hakutoiveet))
              v.hakutoiveet
            else
              List.empty
          case _ => List.empty
        }

      }
    }
    ApplicationEnriched(
      application.oid,
      haku,
      hakukohteet,
      ohjausparametrit,
      application.secret,
      application.submitted,
      hakutoiveidenTulokset,
      application.formName
    )
  }
}
