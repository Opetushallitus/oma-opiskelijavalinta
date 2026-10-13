package fi.oph.opiskelijavalinta.clients

import fi.vm.sade.javautils.nio.cas.CasClient
import org.asynchttpclient.{Request, Response}
import org.junit.jupiter.api.{Assertions, Test}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito

import java.util.concurrent.CompletableFuture
import scala.concurrent.ExecutionContext

class OppijanTunnistusClientTest {

  private val TOKEN = "test-token"

  private def clientReturning(response: Response): OppijanTunnistusClient = {
    val casClient = Mockito.mock(classOf[CasClient])
    Mockito
      .when(casClient.execute(any(classOf[Request])))
      .thenReturn(CompletableFuture.completedFuture(response))
    new OppijanTunnistusClient(casClient, ExecutionContext.global, 10)
  }

  private def response(statusCode: Int, body: String): Response = {
    val res = Mockito.mock(classOf[Response])
    Mockito.when(res.getStatusCode).thenReturn(statusCode)
    Mockito.when(res.getStatusText).thenReturn("")
    Mockito.when(res.getResponseBody).thenReturn(body)
    res
  }

  @Test
  def returnsResponseBodyOn200(): Unit = {
    val client = clientReturning(response(200, """{"exists":true,"valid":true}"""))

    Assertions.assertEquals(Right("""{"exists":true,"valid":true}"""), client.verifyToken(TOKEN))
  }

  @Test
  def returnsLeftOnUnauthorized(): Unit = {
    val client = clientReturning(response(401, "unauthorized"))

    Assertions.assertTrue(client.verifyToken(TOKEN).isLeft)
  }

  @Test
  def returnsLeftOnNotFound(): Unit = {
    // 404 = väärä osoite, ei tuntematon token; oppijan-tunnistus vastaa tuntemattomaankin tokeniin 200:lla.
    val client = clientReturning(response(404, """{"error":"not found"}"""))

    Assertions.assertTrue(client.verifyToken(TOKEN).isLeft)
  }

  @Test
  def returnsLeftOnServerError(): Unit = {
    val client = clientReturning(response(500, "boom"))

    Assertions.assertTrue(client.verifyToken(TOKEN).isLeft)
  }
}
