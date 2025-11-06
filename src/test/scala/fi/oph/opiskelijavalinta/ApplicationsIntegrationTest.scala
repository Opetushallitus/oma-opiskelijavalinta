package fi.oph.opiskelijavalinta

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.Application
import fi.oph.opiskelijavalinta.resource.ApiConstants
import org.junit.jupiter.api.*
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.{WithAnonymousUser, WithMockUser}
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util

class ApplicationsIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATION_PATH))
      .andExpect(status().isUnauthorized)
  }

  @Test
  def returnsApplicationsOfUser(): Unit = {
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)

    val result = mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATION_PATH)
        .`with`(user(oppijaUser)))
      .andExpect(status().isOk)
      .andReturn()

    Assertions.assertEquals(result.getResponse.getContentAsString, "[{\"haku\":\"haku-1\",\"hakukohteet\":[\"hk-1\",\"hk-2\"],\"secret\":\"secret1\"}]")
  }
}

