package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.Constants
import fi.oph.opiskelijavalinta.clients.ClientUtils.toScalaFuture
import org.asynchttpclient.{AsyncHttpClient, RequestBuilder, Response}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import scala.concurrent.{ExecutionContext, Future}

@Component
class Oauth2Client @Autowired (
  private val oauth2BearerClient: Oauth2BearerClient,
  private val client: AsyncHttpClient,
  httpExecutionContext: ExecutionContext
) {

  val LOG: Logger                           = LoggerFactory.getLogger(classOf[Oauth2Client]);
  implicit private val ec: ExecutionContext = httpExecutionContext

  private def execute(requestBuilder: RequestBuilder): Future[Response] = {
    val bearer  = oauth2BearerClient.getOauth2Bearer
    val request = requestBuilder
      .setHeader("Authorization", "Bearer " + bearer)
      .setHeader("Caller-Id", Constants.CALLER_ID)
      .build
    toScalaFuture(client.executeRequest(request))
  }

  def executeRequest(requestBuilder: RequestBuilder): Future[Response] = {
    execute(requestBuilder).flatMap { res =>
      if (res.getStatusCode == 401) {
        val authHeader = Option(res.getHeader("WWW-Authenticate")).getOrElse("")
        LOG.debug(s"received WWW-authenticate header: $authHeader")
        if (authHeader.contains("invalid_token")) {
          LOG.debug("Invalid token, refreshing OAuth2 bearer")
          oauth2BearerClient.evictOauth2Bearer()
          execute(requestBuilder) // retry
        } else {
          Future.successful(res)
        }
      } else {
        Future.successful(res)
      }
    }
  }
}
