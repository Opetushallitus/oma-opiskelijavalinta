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
    Assertions.assertTrue(result.exists)
    Assertions.assertTrue(result.valid)
  }

  @Test
  def returnsVerificationForExpiredToken(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Right("""{"exists": true, "valid": false}"""))
    val result = service.verify(TOKEN)
    Assertions.assertTrue(result.exists)
    Assertions.assertFalse(result.valid)
  }

  @Test
  def returnsVerificationForUnknownToken(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Right("""{"exists": false, "valid": false}"""))
    val result = service.verify(TOKEN)
    Assertions.assertFalse(result.exists)
    Assertions.assertFalse(result.valid)
  }

  @Test
  def throwsWhenClientFails(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Left(RuntimeException("verkkovirhe")))
    Assertions.assertThrows(classOf[RuntimeException], () => service.verify(TOKEN))
  }

  @Test
  def throwsWhenDeserializationFails(): Unit = {
    Mockito
      .when(oppijanTunnistusClient.verifyToken(TOKEN))
      .thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => service.verify(TOKEN))
  }
}
