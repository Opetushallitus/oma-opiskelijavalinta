package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.Constants
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired

import java.io.IOException
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClientException

import java.net.http.HttpResponse.BodyHandlers
import java.time.Duration

@Component
class Oauth2Client @Autowired (private val oauth2BearerClient: Oauth2BearerClient) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[Oauth2Client]);

  private def execute(requestBuilder: HttpRequest.Builder): HttpResponse[String] = try {
    val bearer = oauth2BearerClient.getOauth2Bearer
    val request = requestBuilder
      .timeout(Duration.ofSeconds(35))
      .setHeader("Authorization", "Bearer " + bearer)
      .setHeader("Caller-Id", Constants.CALLER_ID)
      .build
    val client = HttpClient.newBuilder.build
    client.send(request, BodyHandlers.ofString)
  } catch {
    case e@(_: IOException | _: InterruptedException) =>
      LOG.error("error while executing request", e)
      throw new RestClientException("error while executing request", e)
  }

  @throws[RestClientException]
  def executeRequest(requestBuilder: HttpRequest.Builder): HttpResponse[String] = {
    val res = execute(requestBuilder)
    if (res.statusCode == 401) {
      LOG.info("received WWW-authenticate header: " + res.headers.firstValue("WWW-Authenticate").orElse(""))
      val authHeader = res.headers.firstValue("WWW-Authenticate")
      if (authHeader.orElse("").contains("invalid_token")) {
        oauth2BearerClient.evictOauth2Bearer()
        return execute(requestBuilder)
      }
    }
    res
  }
}
