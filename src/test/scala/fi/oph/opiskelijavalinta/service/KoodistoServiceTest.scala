package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.KoodistoClient
import fi.oph.opiskelijavalinta.model.{KoodistoKoodi, KoodistoMetadata}
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class KoodistoServiceTest {

  val koodistoClient: KoodistoClient = Mockito.mock(classOf[KoodistoClient])
  val service: KoodistoService       = KoodistoService(koodistoClient)

  val KOODISTO = "hyvaksynnanehdot"

  @Test
  def returnsKooditWhenSuccessful(): Unit = {
    val koodit = Array(KoodistoKoodi("ltt", List(KoodistoMetadata("Lopullinen tutkintotodistus", "FI"))))
    Mockito.when(koodistoClient.getKoodit(KOODISTO)).thenReturn(Right(objectMapper.writeValueAsString(koodit)))
    val result = service.getKooditForKoodisto(KOODISTO)
    Assertions.assertEquals(1, result.size)
    Assertions.assertEquals("ltt", result.head.koodiArvo)
  }

  @Test
  def returnsEmptyWhenClientFails(): Unit = {
    Mockito.when(koodistoClient.getKoodit(KOODISTO)).thenReturn(Left(RuntimeException("verkkovirhe")))
    Assertions.assertTrue(service.getKooditForKoodisto(KOODISTO).isEmpty)
  }

  @Test
  def returnsEmptyWhenDeserializationFails(): Unit = {
    Mockito.when(koodistoClient.getKoodit(KOODISTO)).thenReturn(Right("invalid json"))
    Assertions.assertTrue(service.getKooditForKoodisto(KOODISTO).isEmpty)
  }
}
