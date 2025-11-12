package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.Constants
import org.asynchttpclient.Dsl.asyncHttpClient
import org.asynchttpclient.{AsyncHttpClient, DefaultAsyncHttpClientConfig, ListenableFuture, RequestBuilder, Response}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext, Future, Promise}
import scala.util.{Failure, Success, Try}


case class Ohjausparametrit(PH_HKP: Option[DateParam], // hakukierrosPaattyy
                            PH_IP: Option[DateParam],  // ilmoittautuminenPaattyy
                            PH_VTJH: Option[DateParam], // tulostenJulkistusAlkaa
                           )

case class DateParam(date: Option[Long])

case class ValueParam(value: Option[Int])

class OhjausparametritClient {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OhjausparametritClient]);

  private val client: AsyncHttpClient = asyncHttpClient(
    new DefaultAsyncHttpClientConfig.Builder()
    .setMaxRedirects(5)
    .setConnectTimeout(java.time.Duration.ofMillis(10 * 1000))
    .build)

  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)

  // TODO optimoi myöhemmin http-clientien thread pool
  implicit val ec: ExecutionContext = ExecutionContext.Implicits.global

  def getOhjausparametritForHaku(hakuOid: String): Either[Throwable, Ohjausparametrit] = {
    val url = s"https://$opintopolku_virkailija_domain/ohjausparametrit-service/api/v1/rest/parametri/$hakuOid"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, Ohjausparametrit] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setHeader("Caller-Id", Constants.CALLER_ID)
      .setUrl(url)
      .setRequestTimeout(java.time.Duration.ofMillis(5000))
      .build()

    LOG.info(s"Fetching ohjausparametrit from: $url")

    try
      val futureResponse: Future[Either[Throwable, Ohjausparametrit]] =
        toScalaFuture(client.executeRequest(req)).map { r =>
          if r.getStatusCode == 200 then
            try
              val parsed =
                mapper.readValue(r.getResponseBody, classOf[Ohjausparametrit])
              LOG.info(s"Successfully fetched ohjausparametrit: $parsed")
              Right(parsed)
            catch
              case e: Throwable =>
                LOG.error("Error parsing ohjausparametrit JSON", e)
                Left(e)
          else
            val msg =
              s"HTTP ${r.getStatusCode}: ${r.getStatusText} - ${r.getResponseBody}"
            LOG.error(s"Error fetching ohjausparametrit: $msg")
            Left(RuntimeException(msg))
        }

      // Synchronous wait
      Await.result(futureResponse, Duration(5, TimeUnit.SECONDS))
    catch
      case e: Throwable =>
        LOG.error(s"Exception fetching ohjausparametrit: ${e.getMessage}", e)
        Left(e)
  }

  /**
   * Convert an AsyncHttpClient ListenableFuture into a Scala Future.
   */
  def toScalaFuture(listenableFuture: ListenableFuture[Response])
                   (using ec: ExecutionContext): Future[Response] = {
    val promise = Promise[Response]()

    listenableFuture.addListener(
      () => Try(listenableFuture.get()) match
        case Success(resp) => promise.success(resp)
        case Failure(ex) => promise.failure(ex),
      r => ec.execute(r)
    )
    promise.future
  }
  
}
