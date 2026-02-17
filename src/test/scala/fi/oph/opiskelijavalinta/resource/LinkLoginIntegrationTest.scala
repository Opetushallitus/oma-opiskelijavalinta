package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.oph.opiskelijavalinta.configuration.{LinkAuthenticationProvider, LinkVerificationService}
import fi.oph.opiskelijavalinta.model.{OppijanTunnistusVerification, OppijantunnistusMetadata}
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
        OppijanTunnistusVerification(
          exists = false,
          valid = false,
          metadata = None
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
  }

  @Test
  def returnsOkForValidToken(): Unit = {
    Mockito
      .when(verificationService.verify("valid-token"))
      .thenReturn(
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
