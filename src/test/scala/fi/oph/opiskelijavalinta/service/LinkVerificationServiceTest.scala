package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.clients.OppijanTunnistusClient
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class LinkVerificationServiceTest {

  val oppijanTunnistusClient: OppijanTunnistusClient = Mockito.mock(classOf[OppijanTunnistusClient])
  val service: LinkVerificationService               = LinkVerificationService(oppijanTunnistusClient)

  val TOKEN = "test-token"

  @Test
  def returnsVerificationWhenSuccessful(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Right("""{"exists": true, "valid": true}"""))
    val result = service.verify(TOKEN)
    Assertions.assertTrue(result.isDefined)
    Assertions.assertTrue(result.get.exists)
    Assertions.assertTrue(result.get.valid)
  }

  @Test
  def returnsNoneWhenClientFails(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Left(RuntimeException("verkkovirhe")))
    val result = service.verify(TOKEN)
    Assertions.assertTrue(result.isEmpty)
  }

  @Test
  def returnsNoneWhenDeserializationFails(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Right("invalid json"))
    val result = service.verify(TOKEN)
    Assertions.assertTrue(result.isEmpty)
  }
}
