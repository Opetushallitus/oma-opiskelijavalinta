package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.time.Duration as JavaDuration
import scala.jdk.javaapi.FutureConverters.asScala
import scala.concurrent.{Await, ExecutionContext}
import scala.concurrent.duration.Duration
import java.util.concurrent.TimeUnit

class KoutaClient @Autowired (koutaCasClient: CasClient, 
                              httpExecutionContext: ExecutionContext) {

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  private val LOG: Logger = LoggerFactory.getLogger(classOf[KoutaClient])
  implicit private val ec: ExecutionContext = httpExecutionContext
  
  def getHaku(hakuOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/kouta-internal/haku/$hakuOid"
    fetch(url)
  }

  def getHakukohde(hakukohdeOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/kouta-internal/hakukohde/$hakukohdeOid"
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
      val result = asScala(koutaCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug("Kouta-tiedot haettu onnistuneesti")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Virhe kouta-tietojen hakemisessa: ${r.getStatusCode} ${r.getStatusText} $url ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Failed to fetch applications: " + r.getResponseBody()))
      }
      Await.result(result, Duration(5, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Virhe kouta-tietojen hakemisessa: ${e.getMessage}", e)
        Left(e)
    }
  }
}
