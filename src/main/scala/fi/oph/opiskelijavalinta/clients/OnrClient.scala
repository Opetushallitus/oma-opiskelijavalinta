package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.clients.model.Oppija
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import java.net.URI
import java.net.http.HttpRequest

@Component
class OnrClient @Autowired (httpClient: Oauth2Client, objectMapper: ObjectMapper = new ObjectMapper()) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[OnrClient]);

  def getPersonInfo(oid: String): Oppija = {
    val url = s"https://virkailija.untuvaopintopolku.fi/oppijanumerorekisteri-service/henkilo/$oid/master"
    val request = HttpRequest.newBuilder.uri(URI.create(url)).GET
    val response = httpClient.executeRequest(request)
    LOG.info("ORN Body: " + response.body + " oid: " + oid + " status: " + response.statusCode)
    objectMapper.readValue(response.body, classOf[Oppija])
  }
}
