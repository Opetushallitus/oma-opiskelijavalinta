package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import org.apereo.cas.client.validation.{TicketValidationException, TicketValidator}
import org.junit.jupiter.api.{Assertions, Test}
import org.mockito.ArgumentMatchers.{any, anyString}
import org.mockito.Mockito
import org.springframework.test.context.bean.`override`.mockito.{MockReset, MockitoBean}
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

class CasLoginIntegrationTest extends BaseIntegrationTest {

  @MockitoBean(reset = MockReset.BEFORE)
  val ticketValidator: TicketValidator = Mockito.mock(classOf[TicketValidator])

  @Test
  def returnsUnauthorizedForInvalidTicket(): Unit = {
    Mockito
      .when(ticketValidator.validate(anyString(), anyString()))
      .thenThrow(new TicketValidationException("tiketti ei kelpaa"))

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.CAS_TICKET_VALIDATION_PATH)
          .param("ticket", "ST-invalid")
      )
      .andExpect(status().isUnauthorized)
    // Epäonnistunut validointi ei saa johtaa uusiin validointiyrityksiin (aiemmin AuthenticationManager oli oma parentinsa)
    Mockito.verify(ticketValidator, Mockito.times(1)).validate(any(), any())
    Assertions.assertTrue(
      capturedOutput.getOut
        .split("\n")
        .exists(line => line.contains("WARN") && line.contains("CAS-tiketin validointi epäonnistui: tiketti ei kelpaa"))
    )
  }
}
