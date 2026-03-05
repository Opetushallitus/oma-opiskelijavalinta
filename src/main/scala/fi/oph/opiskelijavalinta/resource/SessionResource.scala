package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.SESSION_PATH
import fi.oph.opiskelijavalinta.service.AuthorizationService
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(SESSION_PATH))
@RestController
class SessionResource @Autowired (authorizationService: AuthorizationService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SessionResource]);

  case class SessionResponse(authMethod: String)

  @GetMapping(path = Array(""))
  def response: ResponseEntity[SessionResponse] = {
    LOG.info("Getting session")
    val linkUser   = authorizationService.hasLinkUserRole
    val authMethod = if (linkUser) "link" else "cas"
    ResponseEntity.ok(SessionResponse(authMethod))
  }
}
