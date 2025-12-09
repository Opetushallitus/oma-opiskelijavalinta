package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.oppijaUser
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class VastaanottoIntegrationTest extends BaseIntegrationTest {

  val HAKEMUS_OID = "HAKEMUS-OID-1"
  val HAKUKOHDE_OID = "HAKUKOHDE-OID-1"

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content("VastaanotaSitovasti")
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def doesVastaanotto(): Unit = {
    Mockito
      .when(valintaTulosServiceClient.postVastaanotto(HAKEMUS_OID, HAKUKOHDE_OID, "VastaanotaSitovasti"))
      .thenReturn(Right("OK"))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content("VastaanotaSitovasti")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
  }
}

