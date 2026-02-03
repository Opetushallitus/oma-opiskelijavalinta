package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, HAKEMUS_OID, HAKUKOHDE_OID, HAKU_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class VastaanottoIntegrationTest extends BaseIntegrationTest {

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
      .when(ataruClient.getHakemukset(PERSON_OID))
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
      .when(ataruClient.getHakemukset(PERSON_OID))
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
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                Option.empty,
                Option.empty
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
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                HAKEMUS_OID,
                HAKU_OID,
                List(HAKUKOHDE_OID, "hakukohde-oid-2"),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                Option.empty,
                Option.empty
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
