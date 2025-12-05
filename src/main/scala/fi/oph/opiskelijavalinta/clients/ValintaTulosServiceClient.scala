package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.ExecutionContext.Implicits.global // TODO thread pool OPHYOS-47

class ValintaTulosServiceClient @Autowired (vtsCasClient: CasClient) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[ValintaTulosServiceClient]);

  def getValinnanTulokset(hakuOid: String, hakemusOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/valinta-tulos-service/cas/haku/$hakuOid/hakemus/$hakemusOid"
    fetch(url)
  }

  def postVastaanotto(hakemusOid: String, hakukohdeOid: String): Either[Throwable, String] = {
    val url =
      s"https://$opintopolku_virkailija_domain/valinta-tulos-service/auth/vastaanotto/hakemus/$hakemusOid/hakukohde/$hakukohdeOid"
    post(url, "{\"action\": \"VastaanotaSitovasti\"}")
  }

  private def post(url: String, body: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("POST")
      .setHeader("Content-Type", "application/json")
      .setBody(body)
      .setUrl(url)
      .setRequestTimeout(java.time.Duration.ofMillis(5000))
      .build()
    try {
      val result = asScala(vtsCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Vastaanotto tehty onnistuneesti")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Vastaanoton teko epäonnistui: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Vastaanoton teko epäonnistui: " + r.getResponseBody()))
      }
      Await.result(result, Duration(5, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Vastaanoton teko epäonnistui: ${e.getMessage}", e)
        Left(e)
    }
  }

  private def fetch(url: String): Either[Throwable, String] = {
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .setRequestTimeout(java.time.Duration.ofMillis(5000))
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
      Await.result(result, Duration(5, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Valintatulosten haku valintatulospalvelusta epäonnistui: ${e.getMessage}", e)
        Left(e)
    }
  }

}
