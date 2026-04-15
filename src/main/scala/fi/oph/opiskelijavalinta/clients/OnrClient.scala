package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.clients.model.Oppija
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration

@Component
class OnrClient @Autowired (oauth2Client: Oauth2Client, objectMapper: ObjectMapper = new ObjectMapper()) {

  @Value("${host.virkailija}")
  private val virkailijaHost = ""

  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrClient]);

  private def fetchPersonInfo(url: String): Oppija = {
    val requestBuilder = new RequestBuilder()
      .setMethod("GET")
      .setUrl(url)

    val response = Await.result(oauth2Client.executeRequest(requestBuilder), Duration(5, TimeUnit.SECONDS))
    objectMapper.readValue(response.getResponseBody, classOf[Oppija])
  }

  def getPersonInfo(oid: String): Oppija = {
    LOG.info(s"Haetaan käyttäjän tiedot onr:sta oppijanumerolla $oid")
    fetchPersonInfo(s"https://$virkailijaHost/oppijanumerorekisteri-service/henkilo/$oid/master")
  }

  def getPersonInfoByHetu(hetu: String): Oppija = {
    LOG.info(s"Haetaan käyttäjän tiedot onr:sta hetulla $hetu")
    fetchPersonInfo(s"https://$virkailijaHost/oppijanumerorekisteri-service/henkilo/hetu=$hetu")
  }
}
