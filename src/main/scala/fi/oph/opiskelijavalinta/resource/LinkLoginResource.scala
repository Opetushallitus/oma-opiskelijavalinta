package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.configuration.LinkAuthenticationToken
import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.core.context.{SecurityContext, SecurityContextHolder}
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.{PostMapping, RequestMapping, RequestParam, RestController}

@RestController
@RequestMapping(path = Array("/api"))
class LinkLoginResource(
  authenticationManager: AuthenticationManager,
  securityContextRepository: SecurityContextRepository
) {

  @PostMapping(path = Array("/link-login"))
  def linkLogin(
    @RequestParam token: String,
    request: HttpServletRequest,
    response: HttpServletResponse
  ): ResponseEntity[String] = {

    val authRequest = new LinkAuthenticationToken(token)

    val authentication = authenticationManager.authenticate(authRequest)

    val context: SecurityContext = SecurityContextHolder.createEmptyContext()
    context.setAuthentication(authentication)
    SecurityContextHolder.setContext(context)

    securityContextRepository.saveContext(context, request, response)

    ResponseEntity.ok("OK")
  }
}
