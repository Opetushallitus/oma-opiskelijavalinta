package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.OnrClient
import fi.oph.opiskelijavalinta.clients.model.Oppija
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class OnrServiceTest {

  val onrClient: OnrClient = Mockito.mock(classOf[OnrClient])
  val service: OnrService  = OnrService(onrClient, objectMapper)

  val OID  = "1.2.246.562.24.12345678901"
  val HETU = "010190-123A"

  val oppija = Oppija(
    "1.2.246.562.24.12345678901",
    "2020-01-01",
    "Testi",
    "Testinen"
  )

  @Test
  def returnsPersonInfoWhenSuccessful(): Unit = {
    Mockito
      .when(onrClient.getPersonInfo(OID))
      .thenReturn(Right(objectMapper.writeValueAsString(oppija)))

    val result = service.getPersonInfo(OID)

    Assertions.assertEquals(oppija, result)
  }

  @Test
  def throwsWhenClientFails(): Unit = {
    Mockito
      .when(onrClient.getPersonInfo(OID))
      .thenReturn(Left(RuntimeException("verkkovirhe")))

    val exception = Assertions.assertThrows(
      classOf[RuntimeException],
      () => service.getPersonInfo(OID)
    )

    Assertions.assertEquals(
      s"Henkilötietojen haku epäonnistui oppijanumerolla $OID",
      exception.getMessage
    )
  }

  @Test
  def throwsWhenDeserializationFails(): Unit = {
    Mockito
      .when(onrClient.getPersonInfo(OID))
      .thenReturn(Right("invalid json"))

    val exception = Assertions.assertThrows(
      classOf[RuntimeException],
      () => service.getPersonInfo(OID)
    )

    Assertions.assertTrue(
      exception.getMessage.contains("Henkilötietojen deserialisointi epäonnistui")
    )
  }

  @Test
  def returnsPersonInfoByHetuWhenSuccessful(): Unit = {
    Mockito
      .when(onrClient.getPersonInfoByHetu(HETU))
      .thenReturn(Right(objectMapper.writeValueAsString(oppija)))

    val result = service.getPersonInfoByHetu(HETU)

    Assertions.assertEquals(oppija, result)
  }

  @Test
  def throwsWhenClientFailsByHetu(): Unit = {
    Mockito
      .when(onrClient.getPersonInfoByHetu(HETU))
      .thenReturn(Left(RuntimeException("verkkovirhe")))

    val exception = Assertions.assertThrows(
      classOf[RuntimeException],
      () => service.getPersonInfoByHetu(HETU)
    )

    Assertions.assertEquals(
      "Henkilötietojen haku epäonnistui hetulla",
      exception.getMessage
    )
  }

  @Test
  def throwsWhenDeserializationFailsByHetu(): Unit = {
    Mockito
      .when(onrClient.getPersonInfoByHetu(HETU))
      .thenReturn(Right("invalid json"))

    val exception = Assertions.assertThrows(
      classOf[RuntimeException],
      () => service.getPersonInfoByHetu(HETU)
    )

    Assertions.assertTrue(
      exception.getMessage.contains("Henkilötietojen deserialisointi epäonnistui")
    )
  }
}
