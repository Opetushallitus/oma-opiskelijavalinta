package fi.oph.opiskelijavalinta

import fi.oph.opiskelijavalinta.resource.ApiConstants
import org.junit.jupiter.api.*
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class HealthCheckIntegraatioTest extends BaseIntegraatioTesti {

  @WithAnonymousUser
  @Test def testHealthCheckAnonymous(): Unit =
    mvc.perform(MockMvcRequestBuilders
      .get(ApiConstants.HEALTHCHECK_PATH))
      .andExpect(status().isOk)
      .andExpect(MockMvcResultMatchers.content().string("OK"));
}
