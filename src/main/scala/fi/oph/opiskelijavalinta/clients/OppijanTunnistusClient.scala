package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.util.concurrent.TimeUnit
import scala.concurrent.{Await, ExecutionContext}
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala

class OppijanTunnistusClient @Autowired (
  oppijanTunnistusCasClient: CasClient,
  httpExecutionContext: ExecutionContext,
  timeoutSeconds: Int
) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OppijanTunnistusClient])

  implicit private val ec: ExecutionContext = httpExecutionContext

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  def verifyToken(token: String): Either[Throwable, Option[String]] = {
    val url =
      s"https://$opintopolku_virkailija_domain/oppijan-tunnistus/api/v1/token/$token"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, Option[String]] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .build()
    try {
      val result = asScala(oppijanTunnistusCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Oppijan-tunnistus token verifioitiin")
          Right(Some(r.getResponseBody()))
        case r if r.getStatusCode == 404 || r.getStatusCode == 400 =>
          // 404 = tokenia ei ole olemassa, 400 = token ei ole kelvollisen muotoinen. Kumpikaan ei ole palveluvirhe,
          // vaan kutsuja tulkitsee nämä virheelliseksi tokeniksi. 401/403/5xx sen sijaan ovat meidän vikamme.
          LOG.warn(s"Oppijan-tunnistus ei tunnistanut tokenia: ${r.getStatusCode} ${r.getStatusText}")
          Right(None)
        case r =>
          LOG.error(
            s"Virhe oppijan-tunnistus tokenin verifioinnissa: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Failed to verify token: " + r.getResponseBody()))
      }
      Await.result(result, Duration(timeoutSeconds, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Virhe oppijan-tunnistus tokenin verioinnissa: ${e.getMessage}", e)
        Left(e)
    }
  }
}
