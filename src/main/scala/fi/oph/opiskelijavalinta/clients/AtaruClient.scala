package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.vm.sade.javautils.nio.cas.CasClient
import fi.oph.opiskelijavalinta.model.Application
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

import scala.concurrent.ExecutionContext.Implicits.global
import java.time.Duration as JavaDuration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

@Profile(Array("!test"))
@Component
class AtaruClient @Autowired (ataruCasClient: CasClient) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[AtaruClient]);

  def getApplications(oppijanumero: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/lomake-editori/api/external/omatsivut/applications/$oppijanumero"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .setRequestTimeout(JavaDuration.ofMillis(5000))
      .build()
    LOG.info(url)
    LOG.info(ataruCasClient.toString)
    try {
      val result = asScala(ataruCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.info("Succesfully fetched applications")
          Right(r.getResponseBody())
        case r =>
          LOG.error(s"Error fetching applications from hakemuspalvelu: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}")
          Left(new RuntimeException("Failed to fetch applications: " + r.getResponseBody()))
      }
      Await.result(result, Duration(5, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Error fetching applications from hakemuspalvelu: ${e.getMessage}", e)
        Left(e)
    }
  }
}

