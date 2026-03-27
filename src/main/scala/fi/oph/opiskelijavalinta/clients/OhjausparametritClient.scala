package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.Constants
import fi.oph.opiskelijavalinta.clients.ClientUtils.toScalaFuture
import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.{AsyncHttpClient, DefaultAsyncHttpClientConfig, RequestBuilder, Response}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future}

class OhjausparametritClient {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OhjausparametritClient])

  private val client: AsyncHttpClient = asyncHttpClient(
    new DefaultAsyncHttpClientConfig.Builder()
      .setMaxRedirects(5)
      .setConnectTimeout(java.time.Duration.ofMillis(10 * 1000))
      .build
  )

  // TODO http-clientien thread pool OPHYOS-47
  implicit val ec: ExecutionContext = ExecutionContext.Implicits.global

  def getOhjausparametritForHaku(hakuOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/ohjausparametrit-service/api/v1/rest/parametri/$hakuOid"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setHeader("Caller-Id", Constants.CALLER_ID)
      .setUrl(url)
      .setRequestTimeout(java.time.Duration.ofMillis(5000))
      .build()

    LOG.info(s"Haetaan ohjausparametrit osoitteesta: $url")

    try
      val futureResponse: Future[Either[Throwable, String]] =
        toScalaFuture(client.executeRequest(req)).map { r =>
          if r.getStatusCode == 200 then
            LOG.debug(s"Ohjausparametrit haettu onnistunesti")
            Right(r.getResponseBody())
          else
            val msg =
              s"HTTP ${r.getStatusCode}: ${r.getStatusText} - ${r.getResponseBody}"
            LOG.error(s"Virhe Ohjausparametrien hakemisessa: $msg")
            Left(RuntimeException(msg))
        }
      // Synchronous wait
      Await.result(futureResponse, Duration(5, TimeUnit.SECONDS))
    catch
      case e: Throwable =>
        LOG.error(s"Virhe ohjausparametrien hakemisessa: ${e.getMessage}", e)
        Left(e)
  }

}
