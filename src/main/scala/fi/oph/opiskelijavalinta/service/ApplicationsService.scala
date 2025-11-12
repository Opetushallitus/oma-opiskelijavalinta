package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.vm.sade.javautils.nio.cas.CasClient
import fi.oph.opiskelijavalinta.model.{Application, ApplicationEnriched}
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Service

import scala.concurrent.ExecutionContext.Implicits.global
import java.time.Duration as JavaDuration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

@Service
class ApplicationsService @Autowired(ataruClient: AtaruClient, koutaService: KoutaService, ohjausparametritService: OhjausparametritService, mapper: ObjectMapper = new ObjectMapper()) {

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[ApplicationsService]);

  def getApplications(oppijanumero: String): Seq[ApplicationEnriched] = {
    ataruClient.getApplications(oppijanumero) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch applications for personOid $oppijanumero: ${e.getMessage}")
        Seq.empty
      case Right(o) => 
        val apps = mapper.readValue(o, classOf[Array[Application]]).toSeq
        apps.map(a => enrichApplication(a))
    }
  }
  
  private def enrichApplication(application: Application): ApplicationEnriched = {
    val haku = koutaService.getHaku(application.haku)
    val hakukohteet = application.hakukohteet.map(koutaService.getHakukohde)
    val ohjausparametrit = ohjausparametritService.getOhjausparametritForHaku(application.haku)
    ApplicationEnriched(application.oid, haku, hakukohteet, ohjausparametrit, application.secret)
  }
}
