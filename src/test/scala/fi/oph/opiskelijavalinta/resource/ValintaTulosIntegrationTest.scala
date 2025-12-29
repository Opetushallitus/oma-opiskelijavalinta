package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser}
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.{mockVTSKeskenResponse, mockVTSResponse}
import fi.oph.opiskelijavalinta.model.HakutoiveenTulos
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class ValintaTulosIntegrationTest extends BaseIntegrationTest {

  val HAKEMUS_OID = "HAKEMUS-OID-1"
  val HAKU_OID    = "HAKU-OID-1"

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def returnsOnlyPublishedResults(): Unit = {
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSResponse)))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()
    val tulokset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[HakutoiveenTulos]]).toSeq
    Assertions.assertEquals(1, tulokset.length)
    Assertions.assertEquals("hakukohde-oid-1", tulokset(0).hakukohdeOid.get)
  }

  @Test
  def returnsNoResultsWhenNoneArePublished(): Unit = {
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSKeskenResponse)))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()
    val tulokset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[HakutoiveenTulos]]).toSeq
    Assertions.assertTrue(tulokset.isEmpty)
  }
}
