package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext}
import scala.jdk.javaapi.FutureConverters.asScala

class MaksutClient(
  maksutCasClient: CasClient,
  httpExecutionContext: ExecutionContext,
  timeoutSeconds: Int
) {

  private val LOG: Logger                   = LoggerFactory.getLogger(classOf[MaksutClient])
  implicit private val ec: ExecutionContext = httpExecutionContext

  @Value("${host.virkailija}")
  val opintopolku_virkailija_domain: String = null

  /**
   * Hakee maksut-palvelusta hakemukseen liittyvät laskut. Hakemusmaksun laskun viitteenä on hakemuksen oid.
   */
  def getLaskut(hakemusOid: String): Either[Throwable, String] = {
    val url = s"https://$opintopolku_virkailija_domain/maksut/api/lasku/$hakemusOid"
    val req = new RequestBuilder()
      .setMethod("GET")
      .setHeader("Content-Type", "application/json")
      .setUrl(url)
      .build()
    try {
      val result = asScala(maksutCasClient.execute(req)).map {
        case r if r.getStatusCode == 200 =>
          LOG.debug(s"Laskut haettu onnistuneesti hakemukselle $hakemusOid")
          Right(r.getResponseBody())
        case r =>
          LOG.error(
            s"Virhe haettaessa laskuja maksut-palvelusta hakemukselle $hakemusOid: ${r.getStatusCode} ${r.getStatusText} ${r.getResponseBody()}"
          )
          Left(new RuntimeException("Failed to fetch invoices: " + r.getResponseBody()))
      }
      Await.result(result, Duration(timeoutSeconds, TimeUnit.SECONDS))
    } catch {
      case e: Throwable =>
        LOG.error(s"Virhe haettaessa laskuja maksut-palvelusta hakemukselle $hakemusOid: ${e.getMessage}", e)
        Left(e)
    }
  }
}
