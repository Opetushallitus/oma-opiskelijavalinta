package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{HAKEMUS_OID, HAKUKOHDE_OID, HAKU_OID, PERSON_OID, objectMapper, oppijaUser}
import fi.oph.opiskelijavalinta.dto.IlmoittautuminenDTO
import fi.oph.opiskelijavalinta.model.{Hakemus, OppijanTunnistusVerification, OppijantunnistusMetadata, TranslatedName}
import fi.oph.opiskelijavalinta.security.AuditOperation
import fi.oph.opiskelijavalinta.service.AllowedIlmoittautumisTila.LASNA_KOKO_LUKUVUOSI
import fi.oph.opiskelijavalinta.service.LinkVerificationService
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.bean.`override`.mockito.{MockReset, MockitoBean}
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{redirectedUrlPattern, status}

class TulosKirjeResourceIntegrationTest extends BaseIntegrationTest {

  @MockitoBean(reset = MockReset.NONE)
  val verificationService: LinkVerificationService = Mockito.mock(classOf[LinkVerificationService])

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

  @Test
  def redirectsToLinkErrorPageWhenInvalidToken(): Unit = {
    Mockito
      .when(verificationService.verify("invalid-token"))
      .thenReturn(
        Some(
          OppijanTunnistusVerification(
            exists = false,
            valid = false,
            metadata = None
          )
        )
      )

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/token/invalid-token")
      )
      .andExpect(status().is3xxRedirection)
      .andExpect(
        redirectedUrlPattern("**/oma-opiskelijavalinta/link-error")
      )
  }

  @Test
  def redirectsToLinkErrorPageWhenVerificationFails(): Unit = {
    Mockito
      .when(verificationService.verify("invalid-token"))
      .thenReturn(None)

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/token/invalid-token")
      )
      .andExpect(status().is3xxRedirection)
      .andExpect(
        redirectedUrlPattern("**/oma-opiskelijavalinta/link-error")
      )
  }

  @Test
  def redirectsToErrorPageOnServerException(): Unit = {

    Mockito
      .when(verificationService.verify("valid-token"))
      .thenReturn(
        Some(
          OppijanTunnistusVerification(
            exists = true,
            valid = true,
            metadata = Some(
              OppijantunnistusMetadata(
                hakemusOid = HAKEMUS_OID,
                personOid = None,
                hakuOid = Some(HAKU_OID)
              )
            )
          )
        )
      )

    Mockito
      .when(tulosKirjeService.getTuloskirje(HAKU_OID, HAKEMUS_OID))
      .thenThrow(new RuntimeException("boom"))

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/token/valid-token")
      )
      .andExpect(status().is3xxRedirection)
      .andExpect(
        redirectedUrlPattern("**/oma-opiskelijavalinta/error")
      )
  }

  @Test
  def returnsTulosKirjeWithValidToken(): Unit = {
    Mockito
      .when(verificationService.verify("valid-token"))
      .thenReturn(
        Some(
          OppijanTunnistusVerification(
            exists = true,
            valid = true,
            metadata = Some(
              OppijantunnistusMetadata(
                hakemusOid = HAKEMUS_OID,
                personOid = None,
                hakuOid = Some(HAKU_OID)
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
          .get(s"${ApiConstants.TULOSKIRJE_PATH}/token/valid-token")
      )
      .andExpect(status().isOk)
    val auditEntries    = getAllAuditLogEntries
    val tuloskirjeAudit = auditEntries.find(
      _.operation == "HAE TULOSKIRJE"
    )
    Assertions.assertTrue(
      tuloskirjeAudit.isDefined
    )
    Assertions.assertEquals(
      HAKEMUS_OID,
      tuloskirjeAudit.get.target("hakemusOid")
    )
  }
}
