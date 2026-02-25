package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.LINK_LOGIN_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation, LinkAuthenticationException, LinkAuthenticationToken}
import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.security.authentication.{AuthenticationManager, BadCredentialsException}
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.{SecurityContext, SecurityContextHolder}
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.{ExceptionHandler, PostMapping, RequestMapping, RequestParam, RestController}

@RestController
@RequestMapping(path = Array(LINK_LOGIN_PATH))
class LinkLoginController(
  @Qualifier("linkAuthenticationManager") linkAuthenticationManager: AuthenticationManager,
  securityContextRepository: SecurityContextRepository
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[LinkLoginController]);

  @PostMapping(path = Array(""))
  def linkLogin(
    @RequestParam token: String,
    request: HttpServletRequest,
    response: HttpServletResponse
  ): ResponseEntity[Any] = {

    if (token == null || token.trim.isEmpty) {
      LOG.warn("Missing token in link login")
      return ResponseEntity
        .badRequest()
        .body(Map("error" -> "missing_token"))
    }

    try {

      val authRequest    = new LinkAuthenticationToken(token)
      val authentication = linkAuthenticationManager.authenticate(authRequest)

      val context = SecurityContextHolder.createEmptyContext()
      context.setAuthentication(authentication)
      SecurityContextHolder.setContext(context)

      securityContextRepository.saveContext(context, request, response)
      AuditLog.log(request, Map.empty, AuditOperation.LinkLogin, None)
      ResponseEntity.ok(Map("status" -> "ok"))

    } catch {
      case ex: LinkAuthenticationException =>
        LOG.warn("Link login failed: {}", ex.getMessage)
        SecurityContextHolder.clearContext()
        ResponseEntity
          .status(HttpStatus.FORBIDDEN)
          .body(Map("error" -> "invalid_or_expired_token"))
    }
  }
}
