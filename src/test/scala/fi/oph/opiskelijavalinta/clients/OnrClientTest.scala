package fi.oph.opiskelijavalinta.clients

import fi.oph.opiskelijavalinta.configuration.ClientTimeoutProperties
import org.asynchttpclient.{RequestBuilder, Response}
import org.junit.jupiter.api.{Assertions, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito

import scala.concurrent.Future

class OnrClientTest {

  private val OID = "1.2.246.562.24.12345678901"

  private def onrClientReturning(response: Response): OnrClient = {
    val oauth2Client = Mockito.mock(classOf[Oauth2Client])
    Mockito
      .when(oauth2Client.executeRequest(any(classOf[RequestBuilder])))
      .thenReturn(Future.successful(response))
    val client    = new OnrClient(oauth2Client, new ClientTimeoutProperties())
    val hostField = classOf[OnrClient].getDeclaredField("virkailijaHost")
    hostField.setAccessible(true)
    hostField.set(client, "virkailija.test")
    client
  }

  private def response(statusCode: Int, body: String): Response = {
    val res = Mockito.mock(classOf[Response])
    Mockito.when(res.getStatusCode).thenReturn(statusCode)
    Mockito.when(res.getStatusText).thenReturn("")
    Mockito.when(res.getResponseBody).thenReturn(body)
    res
  }

  @Test
  def returnsRightWithNoneOn404(): Unit = {
    val client = onrClientReturning(response(404, """{"error":"not found"}"""))

    Assertions.assertEquals(Right(None), client.getPersonInfo(OID))
  }

  @Test
  def returnsResponseBodyOn200(): Unit = {
    val client = onrClientReturning(response(200, """{"oppijanumero":"x"}"""))

    Assertions.assertEquals(Right(Some("""{"oppijanumero":"x"}""")), client.getPersonInfo(OID))
  }

  @Test
  def returnsLeftOnServerError(): Unit = {
    val client = onrClientReturning(response(500, "boom"))

    Assertions.assertTrue(client.getPersonInfo(OID).isLeft)
  }
}
