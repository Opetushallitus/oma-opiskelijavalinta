package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, PERSON_OID}
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class IlmoittautuminenIntegrationTest extends BaseIntegrationTest {

  val HAKEMUS_OID   = "HAKEMUS-OID-1"
  val HAKUKOHDE_OID = "HAKUKOHDE-OID-1"
  val HAKU_OID      = "HAKU-OID-1"

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO("LASNA_KOKO_LUKUVUOSI", HAKU_OID)))
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
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType("application/json")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO("LASNA_KOKO_LUKUVUOSI", HAKU_OID)))
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
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType("application/json")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO("LASNA_KOKO_LUKUVUOSI", HAKU_OID)))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def doesIlmoittautuminen(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                HAKEMUS_OID,
                HAKU_OID,
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
    Mockito
      .when(valintaTulosServiceClient.postIlmoittautuminen(anyString(), anyString(), anyString()))
      .thenReturn(Right("OK"))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType("application/json")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO("LASNA_KOKO_LUKUVUOSI", HAKU_OID)))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
  }
}
