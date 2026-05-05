package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.OhjausparametritClient
import fi.oph.opiskelijavalinta.mockdata.OhjausparametritMockData
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class OhjausparametritServiceTest {

  val ohjausparametritClient: OhjausparametritClient = Mockito.mock(classOf[OhjausparametritClient])
  val service: OhjausparametritService               = OhjausparametritService(ohjausparametritClient)

  val HAKU_OID = "HAKU-OID-1"

  @Test
  def returnsOhjausparametritWhenSuccessful(): Unit = {
    val raw = OhjausparametritMockData.hakukierrosPaattyyTulevaisuudessaMock.get
    Mockito
      .when(ohjausparametritClient.getOhjausparametritForHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(raw)))
    val result = service.getOhjausparametritForHaku(HAKU_OID)
    Assertions.assertTrue(result.PH_HKP.isDefined)
  }

  @Test
  def throwsWhenClientFails(): Unit = {
    Mockito
      .when(ohjausparametritClient.getOhjausparametritForHaku(HAKU_OID))
      .thenReturn(Left(RuntimeException("verkkovirhe")))
    Assertions.assertThrows(classOf[RuntimeException], () => service.getOhjausparametritForHaku(HAKU_OID))
  }

  @Test
  def throwsWhenDeserializationFails(): Unit = {
    Mockito.when(ohjausparametritClient.getOhjausparametritForHaku(HAKU_OID)).thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => service.getOhjausparametritForHaku(HAKU_OID))
  }
}
