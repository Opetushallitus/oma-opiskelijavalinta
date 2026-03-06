package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, HAKEMUS_OID, HAKUKOHDE_OID, HAKU_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.dto.IlmoittautuminenDTO
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import fi.oph.opiskelijavalinta.service.AllowedIlmoittautumisTila.LASNA_KOKO_LUKUVUOSI
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class TulosKirjeResourceIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/haku/$HAKU_OID/hakemus/$HAKEMUS_OID")
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
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/haku/$HAKU_OID/hakemus/$HAKEMUS_OID")
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
                "1.2.246.562.11.00000000000002121542",
                HAKU_OID,
                List("hakukohde-oid-1", "hakukohde-oid-2"),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                None,
                None,
                None
              )
            )
          )
        )
      )
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/haku/$HAKU_OID/hakemus/$HAKEMUS_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def returns404WhenTulosKirjeNotFound(): Unit = {
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
                None,
                None,
                None
              )
            )
          )
        )
      )
    Mockito
      .when(tulosKirjeService.getTuloskirje(HAKU_OID, HAKEMUS_OID))
      .thenReturn(None)
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/haku/$HAKU_OID/hakemus/$HAKEMUS_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isNotFound)
  }

  @Test
  def returnsTulosKirje(): Unit = {
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
                None,
                None,
                None
              )
            )
          )
        )
      )
    Mockito
      .when(tulosKirjeService.getTuloskirje(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Some(Array(Byte.MaxValue)))
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/haku/$HAKU_OID/hakemus/$HAKEMUS_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
  }
}
