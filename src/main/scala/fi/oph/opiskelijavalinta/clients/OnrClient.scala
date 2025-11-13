package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.clients.model.Oppija
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.stereotype.Component

import java.net.URI
import java.net.http.HttpRequest

@Component
class OnrClient @Autowired (httpClient: Oauth2Client, objectMapper: ObjectMapper = new ObjectMapper()) {

  @Value("${host.virkailija}")
  private val virkailijaHost = ""

  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrClient]);

  private def fetchPersonInfo(url: String): Oppija = {
    val request = HttpRequest.newBuilder.uri(URI.create(url)).GET
    val response = httpClient.executeRequest(request)
    LOG.info(response.body())
    objectMapper.readValue(response.body, classOf[Oppija])
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
