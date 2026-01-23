package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import scala.concurrent.ExecutionContext.Implicits.global // TODO thread pool OPHYOS-47
import java.time.Duration as JavaDuration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

class AtaruClient @Autowired (ataruCasClient: CasClient) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[AtaruClient])
  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  def getHakemukset(oppijanumero: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/lomake-editori/api/external/omatsivut/applications/$oppijanumero?with-haku-aika=true"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .setRequestTimeout(JavaDuration.ofMillis(5000))
      .build()
    try {
      val result = asScala(ataruCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Succesfully fetched applications")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Error fetching applications from hakemuspalvelu: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
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
