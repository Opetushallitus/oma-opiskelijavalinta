package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.Constants
import fi.oph.opiskelijavalinta.Constants.LOKALISOINTI_TIMEOUT
import fi.oph.opiskelijavalinta.clients.ClientUtils.toScalaFuture
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.util.concurrent.TimeUnit
import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration.Duration

class LokalisointiClient @Autowired() (
  client: AsyncHttpClient,
  httpExecutionContext: ExecutionContext
) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[LokalisointiClient])

  implicit private val ec: ExecutionContext = httpExecutionContext

  def getLokalisaatiot(lang: SupportedLanguage): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/lokalisointi/tolgee/oma-opiskelijavalinta/$lang.json"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setHeader("Caller-Id", Constants.CALLER_ID)
      .setUrl(url)
      .build()

    LOG.info(s"Haetaan käännökset osoitteesta: $url")

    try
      val futureResponse: Future[Either[Throwable, String]] =
        toScalaFuture(client.executeRequest(req)).map { r =>
          if r.getStatusCode == 200 then
            LOG.debug(s"Käännökset haettu onnistunesti")
            Right(r.getResponseBody())
          else
            val msg =
              s"HTTP ${r.getStatusCode}: ${r.getStatusText} - ${r.getResponseBody}"
            LOG.error(s"Virhe käännösten hakemisessa: $msg")
            Left(RuntimeException(msg))
        }
      // Synchronous wait
      Await.result(futureResponse, Duration(LOKALISOINTI_TIMEOUT, TimeUnit.SECONDS))
    catch
      case e: Throwable =>
        LOG.error(s"Virhe käännösten hakemisessa: ${e.getMessage}", e)
        Left(e)
  }

}
