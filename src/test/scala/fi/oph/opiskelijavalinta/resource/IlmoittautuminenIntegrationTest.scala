package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, oppijaUser, HAKEMUS_OID, HAKUKOHDE_OID, HAKU_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.dto.IlmoittautuminenDTO
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import fi.oph.opiskelijavalinta.service.AllowedIlmoittautumisTila.LASNA_KOKO_LUKUVUOSI
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{anyString, eq as eqTo}
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class IlmoittautuminenIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO(LASNA_KOKO_LUKUVUOSI)))
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
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO(LASNA_KOKO_LUKUVUOSI)))
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
                None,
                None,
                None,
                None,
                None,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                None,
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
          .post(s"${ApiConstants.ILMOITTAUTUMINEN_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType("application/json")
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO(LASNA_KOKO_LUKUVUOSI)))
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
            Array(mockHakemus)
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
          .content(objectMapper.writeValueAsString(IlmoittautuminenDTO(LASNA_KOKO_LUKUVUOSI)))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)

    val bodyCaptor = ArgumentCaptor.forClass(classOf[String])
    Mockito
      .verify(valintaTulosServiceClient, Mockito.atLeastOnce())
      .postIlmoittautuminen(eqTo(HAKEMUS_OID), eqTo(HAKUKOHDE_OID), bodyCaptor.capture())

    val requestBody = objectMapper.readTree(bodyCaptor.getAllValues.get(bodyCaptor.getAllValues.size - 1))
    Assertions.assertEquals("LASNA_KOKO_LUKUVUOSI", requestBody.get("tila").asText)
    Assertions.assertEquals("oma-opiskelijavalinta", requestBody.get("selite").asText)
    Assertions.assertFalse(
      requestBody.has("muokkaaja"),
      "Muokkaajaa ei saa lahettaa, valinta-tulos-service paattelee sen hakemukselta"
    )
  }
}
