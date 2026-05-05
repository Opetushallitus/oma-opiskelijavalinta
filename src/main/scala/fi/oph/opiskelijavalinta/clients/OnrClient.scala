package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.configuration.ClientTimeoutProperties
import org.asynchttpclient.RequestBuilder
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration

@Component
class OnrClient @Autowired (
  oauth2Client: Oauth2Client,
  timeouts: ClientTimeoutProperties
) {

  @Value("${host.virkailija}")
  private val virkailijaHost = ""

  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrClient])

  private def fetch(url: String): Either[Throwable, String] = {
    val requestBuilder = new RequestBuilder().setMethod("GET").setUrl(url)
    try {
      val response = Await.result(oauth2Client.executeRequest(requestBuilder), Duration(timeouts.onr, TimeUnit.SECONDS))
      Right(response.getResponseBody)
    } catch {
      case e: Throwable =>
        LOG.error(s"Virhe haettaessa henkilötietoja osoitteesta $url: ${e.getMessage}", e)
        Left(e)
    }
  }

  def getPersonInfo(oid: String): Either[Throwable, String] = {
    LOG.info(s"Haetaan käyttäjän tiedot onr:sta oppijanumerolla $oid")
    fetch(s"https://$virkailijaHost/oppijanumerorekisteri-service/henkilo/$oid/master")
  }

  def getPersonInfoByHetu(hetu: String): Either[Throwable, String] = {
    LOG.info(s"Haetaan käyttäjän tiedot onr:sta hetulla $hetu")
    fetch(s"https://$virkailijaHost/oppijanumerorekisteri-service/henkilo/hetu=$hetu")
  }
}
