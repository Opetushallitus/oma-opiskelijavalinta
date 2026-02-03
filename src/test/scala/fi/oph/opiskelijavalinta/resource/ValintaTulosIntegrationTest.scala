package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, HAKEMUS_OID, HAKU_OID}
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.{mockVTSKeskenResponse, mockVTSResponse}
import fi.oph.opiskelijavalinta.model.{Hakemus, HakutoiveenTulos}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class ValintaTulosIntegrationTest extends BaseIntegrationTest {

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
  def get403ResponseFromUnauthorizedUser(): Unit = {
    val hakemusNotFoundOid = "1.2.246.562.11.00000000000002121551"
    Mockito
      .when(ataruClient.getHakemukset(hakemusNotFoundOid))
      .thenReturn(Right(objectMapper.writeValueAsString(Array.empty[Hakemus])))
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$hakemusNotFoundOid/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
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
