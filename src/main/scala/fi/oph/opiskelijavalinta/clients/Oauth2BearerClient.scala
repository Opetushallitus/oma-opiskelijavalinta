package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.clients.model.Oauth2Token
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.cache.annotation.{CacheConfig, CacheEvict, Cacheable}
import org.springframework.stereotype.Component
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.io.IOException
import java.net.URI
import java.net.http.HttpRequest.BodyPublishers
import java.net.http.HttpResponse.BodyHandlers
import java.net.http.{HttpClient, HttpRequest}

@Component
@CacheConfig(cacheNames = Array("oauth2Bearer"))
class Oauth2BearerClient @Autowired (final private val objectMapper: ObjectMapper = new ObjectMapper) {

  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
  private val oauth2IssuerUri = ""

  @Value("${oauth2.client}")
  private val oauth2Client = ""

  @Value("${oauth2.secret}")
  private val oauth2Secret = ""

  val LOG: Logger = LoggerFactory.getLogger(classOf[Oauth2BearerClient]);

  @Cacheable(value = Array("oauth2Bearer"), sync = true)
  @throws[IOException]
  @throws[InterruptedException]
  def getOauth2Bearer: String = {
    val tokenUrl = oauth2IssuerUri + "/oauth2/token"
    LOG.info("refetching oauth2 bearer from " + tokenUrl)
    val body = "grant_type=client_credentials&client_id="
      + oauth2Client
      + "&client_secret="
      + oauth2Secret
    val request = HttpRequest.newBuilder
      .uri(URI.create(tokenUrl))
      .header("Content-Type", "application/x-www-form-urlencoded")
      .POST(BodyPublishers.ofString(body))
      .build
    val client = HttpClient.newHttpClient
    val res = client.send(request, BodyHandlers.ofString)
    if (res.statusCode() != 200) throw new RuntimeException("Oauth2 bearer returned status code " + res.statusCode + ": " + res.body)
    objectMapper.readValue(res.body, classOf[Oauth2Token]).access_token
  }

  @CacheEvict(value = Array("oauth2Bearer"), allEntries = true)
  def evictOauth2Bearer(): Unit = {
    LOG.info("evicting oauth2 bearer cache")
  }
}
