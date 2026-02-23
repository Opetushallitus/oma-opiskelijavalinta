package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.time.Duration as JavaDuration
import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.ExecutionContext.Implicits.global // TODO thread pool OPHYOS-47

class OppijanTunnistusClient @Autowired (oppijanTunnistusCasClient: CasClient) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OppijanTunnistusClient])
  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  def verifyToken(token: String): Either[Throwable, String] = {
    val url =
      s"https://$opintopolku_virkailija_domain/oppijan-tunnistus/api/v1/token/$token"
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
      val result = asScala(oppijanTunnistusCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Succesfully verified oppijan-tunnistus token")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Error verifying token in oppijan-tunnistus: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Failed to verify token: " + r.getResponseBody()))
      }
      Await.result(result, Duration(5, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Error verifying token in oppijan-tunnistus: ${e.getMessage}", e)
        Left(e)
    }
  }
}
