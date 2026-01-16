package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, personOid}
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class VastaanottoIntegrationTest extends BaseIntegrationTest {

  val HAKEMUS_OID   = "HAKEMUS-OID-1"
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
  def get403ResponseFromUnauthorizedUserWithoutHakemus(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(personOid))
      .thenReturn(Right(objectMapper.writeValueAsString(Array.empty[Hakemus])))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content("VastaanotaSitovasti")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def get403ResponseFromUnauthorizedUserTryingToAccessWrongHakemus(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(personOid))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                "HAKEMUS-OID-3",
                "haku-oid-1",
                List("hakukohde-oid-1", "hakukohde-oid-2"),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform")
              )
            )
          )
        )
      )
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content("VastaanotaSitovasti")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def doesVastaanotto(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(personOid))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                "HAKEMUS-OID-1",
                "haku-oid-1",
                List("hakukohde-oid-1", "hakukohde-oid-2"),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform")
              )
            )
          )
        )
      )
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
