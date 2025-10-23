package fi.oph.opiskelijavalinta

import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.resource.ApiConstants
import org.junit.jupiter.api.*
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util

class ApiIntegraatioTest extends BaseIntegraatioTesti {

  @WithAnonymousUser
  @Test def testHealthCheckAnonymous(): Unit =
    mvc.perform(MockMvcRequestBuilders
      .get(ApiConstants.HEALTHCHECK_PATH))
      .andExpect(status().isOk)
      .andExpect(MockMvcResultMatchers.content().string("OK"));

  @Test
  def get401ResponseFromAuthenticatedApi(): Unit = {
    mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.SESSION_PATH))
        .andExpect(status().isUnauthorized)
  }

  @Test
  def get200ResponseFromAuthenticatedApiForAuthenticatedUser(): Unit = {
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)

    mvc.perform(MockMvcRequestBuilders
      .get(ApiConstants.SESSION_PATH)
      .`with`(user(oppijaUser)))
      .andExpect(status().isOk)
  }
}
