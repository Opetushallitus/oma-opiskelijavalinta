package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.util.concurrent.TimeUnit
import scala.concurrent.{Await, ExecutionContext}
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala

case class VtsBadRequestException(body: String)
  extends RuntimeException(body)

class ValintaTulosServiceClient @Autowired (
  vtsCasClient: CasClient,
  httpExecutionContext: ExecutionContext,
  timeoutSeconds: Int
) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[ValintaTulosServiceClient]);

  implicit private val ec: ExecutionContext = httpExecutionContext

  def getValinnanTulokset(hakuOid: String, hakemusOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/valinta-tulos-service/cas/haku/$hakuOid/hakemus/$hakemusOid"
    fetch(url)
  }

  def postVastaanotto(hakemusOid: String, hakukohdeOid: String, vastaanotto: String): Either[Throwable, String] = {
    val url =
      s"https://$opintopolku_virkailija_domain/valinta-tulos-service/auth/vastaanotto/hakemus/$hakemusOid/hakukohde/$hakukohdeOid"
    post(url, s"{\"action\": \"$vastaanotto\"}", "vastaanotto")
  }

  def postIlmoittautuminen(hakemusOid: String, hakuOid: String, body: String): Either[Throwable, String] = {
    val url =
      s"https://$opintopolku_virkailija_domain/valinta-tulos-service/cas/haku/$hakuOid/hakemus/$hakemusOid/ilmoittaudu"
    post(url, body, "ilmoittautuminen")
  }

  private def post(url: String, body: String, operation: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("POST")
      .setHeader("Content-Type", "application/json")
      .setBody(body)
      .setUrl(url)
      .build()
    try {
      val result = asScala(vtsCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug(s"$operation tehty onnistuneesti")
          Right(r.getResponseBody())
        case r if r.getStatusCode == 400 =>
          LOG.error(
            s"$operation epäonnistui: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(VtsBadRequestException(r.getResponseBody))
        case r =>
          LOG.error(
            s"$operation epäonnistui: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Vastaanoton teko epäonnistui: " + r.getResponseBody()))
      }
      Await.result(result, Duration(timeoutSeconds, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"$operation epäonnistui: ${e.getMessage}", e)
        Left(e)
    }
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .build()
    try {
      val result = asScala(vtsCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Valintatulokset haettu onnistuneesti")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Valintatulosten haku valintatulospalvelusta epäonnistui: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Failed to fetch applications: " + r.getResponseBody()))
      }
      Await.result(result, Duration(timeoutSeconds, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Valintatulosten haku valintatulospalvelusta epäonnistui: ${e.getMessage}", e)
        Left(e)
    }
  }

}
