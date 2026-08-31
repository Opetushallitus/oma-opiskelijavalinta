package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.model.{OppijanTunnistusVerification, OppijantunnistusMetadata}
import fi.oph.opiskelijavalinta.security.LinkAuthenticationProvider
import fi.oph.opiskelijavalinta.service.{LinkVerificationService, OnrService}
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.bean.`override`.mockito.{MockReset, MockitoBean}
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

class LinkLoginIntegrationTest extends BaseIntegrationTest {

  @MockitoBean(reset = MockReset.NONE)
  val verificationService: LinkVerificationService = Mockito.mock(classOf[LinkVerificationService])

  @Test
  def returnsForbiddenForInvalidToken(): Unit = {
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
          .post("/api/link-login")
          .param("token", "invalid-token")
      )
      .andExpect(status().isForbidden)
      .andExpect(jsonPath("$.error").value("invalid_or_expired_token"))
    Mockito.verifyNoInteractions(onrService)
  }

  @Test
  def returnsForbiddenForFailedVerification(): Unit = {
    Mockito.reset(onrService)
    Mockito
      .when(verificationService.verify("invalid-token"))
      .thenReturn(None)

    mvc
      .perform(
        MockMvcRequestBuilders
          .post("/api/link-login")
          .param("token", "invalid-token")
      )
      .andExpect(status().isForbidden)
      .andExpect(jsonPath("$.error").value("invalid_or_expired_token"))
    Mockito.verifyNoInteractions(onrService)
  }

  @Test
  def returnsInternalServerErrorIfOnrFails(): Unit = {
    Mockito.reset(onrService)
    Mockito
      .when(verificationService.verify("valid-token"))
      .thenReturn(
        Some(
          OppijanTunnistusVerification(
            exists = true,
            valid = true,
            metadata = Some(
              OppijantunnistusMetadata(
                hakemusOid = "1.2.246.562.11.00000000001",
                personOid = Some("1.2.246.562.24.12345678901"),
                hakuOid = Some("1.2.246.562.29.00000000001")
              )
            )
          )
        )
      )
    Mockito
      .when(onrService.getPersonInfo("1.2.246.562.24.12345678901"))
      .thenThrow(new RuntimeException("Henkilötietojen haku epäonnistui oppijanumerolla 1.2.246.562.24.12345678901"))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post("/api/link-login")
          .param("token", "valid-token")
      )
      .andExpect(status().isInternalServerError)
      .andExpect(jsonPath("$.error").value("login_error"))
  }

  @Test
  def returnsOkForValidToken(): Unit = {
    Mockito
      .when(verificationService.verify("valid-token"))
      .thenReturn(
        Some(
          OppijanTunnistusVerification(
            exists = true,
            valid = true,
            metadata = Some(
              OppijantunnistusMetadata(
                hakemusOid = "1.2.246.562.11.00000000001",
                personOid = Some("1.2.246.562.24.12345678901"),
                hakuOid = Some("1.2.246.562.29.00000000001")
              )
            )
          )
        )
      )
    Mockito
      .when(onrService.getPersonInfo("1.2.246.562.24.12345678901"))
      .thenReturn(Oppija("1.2.246.562.24.12345678901", "2020-01-01", "Testi", "Testinen"))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post("/api/link-login")
          .param("token", "valid-token")
      )
      .andExpect(status().isOk)
      .andExpect(jsonPath("$.status").value("ok"))
  }
}
