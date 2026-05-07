package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.util.concurrent.TimeUnit
import scala.concurrent.{Await, ExecutionContext}
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala

case class VtsBadRequestException(body: String) extends RuntimeException(body)

class SuoritusPalveluClient @Autowired (
                             supaCasClient: CasClient,
                             httpExecutionContext: ExecutionContext,
                             timeoutSeconds: Int) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[YosClient]);

  implicit private val ec: ExecutionContext = httpExecutionContext

  def getPaattyvatOpintoOikeudet(hakijaOid: String, hakuOid: String, hakukohdeOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/suorituspalvelu/api/v1/yos/hakija/$hakijaOid/haku/$hakuOid/hakukohde/$hakukohdeOid/opiskeluoikeudet"
    fetch(url)
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .build()
    try {
      val result = asScala(supaCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Päättyvät opinto-oikeudet haettu onnistuneesti")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Päättyvien opinto-oikeuksien haku suorituspalvelusta epäonnistui: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Päättyvien opinto-oikeuksien haku suorituspalvelusta epäonnistui: " + r.getResponseBody()))
      }
      Await.result(result, Duration(timeoutSeconds, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Päättyvien opinto-oikeuksien haku suorituspalvelusta epäonnistui: ${e.getMessage}", e)
        Left(e)
    }
  }

}
