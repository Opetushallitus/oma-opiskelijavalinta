package fi.oph.opiskelijavalinta.clients

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.clients.ClientUtils.toScalaFuture
import fi.oph.opiskelijavalinta.clients.model.Oauth2Token
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.cache.annotation.{CacheConfig, CacheEvict, Cacheable}
import org.springframework.stereotype.Component
import org.springframework.beans.factory.annotation.{Autowired, Value}

import java.io.IOException
import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext}

@Component
@CacheConfig(cacheNames = Array("oauth2Bearer"))
class Oauth2BearerClient @Autowired (
  final private val objectMapper: ObjectMapper = new ObjectMapper,
  client: AsyncHttpClient,
  httpExecutionContext: ExecutionContext
) {

  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
  private val oauth2IssuerUri = ""

  @Value("${oauth2.client}")
  private val oauth2Client = ""

  @Value("${oauth2.secret}")
  private val oauth2Secret = ""

  val LOG: Logger                           = LoggerFactory.getLogger(classOf[Oauth2BearerClient]);
  implicit private val ec: ExecutionContext = httpExecutionContext

  @Cacheable(value = Array(CacheConstants.OAUTH2_CACHE_NAME), sync = true)
  @throws[IOException]
  @throws[InterruptedException]
  def getOauth2Bearer: String = {
    val tokenUrl = oauth2IssuerUri + "/oauth2/token"
    LOG.info("refetching oauth2 bearer from " + tokenUrl)
    val body = "grant_type=client_credentials&client_id="
      + oauth2Client
      + "&client_secret="
      + oauth2Secret

    val request = new RequestBuilder()
      .setMethod("POST")
      .setUrl(tokenUrl)
      .setHeader("Content-Type", "application/x-www-form-urlencoded")
      .setBody(body)
    val response = Await.result(toScalaFuture(client.executeRequest(request)), Duration(5, TimeUnit.SECONDS))

    if (response.getStatusCode != 200)
      throw new RuntimeException(
        "Oauth2 bearer returned status code " + response.getStatusCode + ": " + response.getResponseBody
      )
    objectMapper.readValue(response.getResponseBody, classOf[Oauth2Token]).access_token
  }

  @CacheEvict(value = Array(CacheConstants.OAUTH2_CACHE_NAME), allEntries = true)
  def evictOauth2Bearer(): Unit = {
    LOG.info("evicting oauth2 bearer cache")
  }
}
