package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.configuration.{OppijaUser, OppijaUserDetails}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/session"))
@RestController
@CrossOrigin(Array("http://localhost:3404"))
class SessionResource {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SessionResource]);

  @GetMapping(path = Array(""))
  def response: ResponseEntity[java.util.Map[String, String]] = {
    LOG.info("Getting session")
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    ResponseEntity.ok(principal.getAttributes)
  }
}
