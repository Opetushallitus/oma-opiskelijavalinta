package fi.oph.opiskelijavalinta.resource

import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/session"))
@RestController
@CrossOrigin(Array("http://localhost:3404"))
class SessionResource {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SessionResource]);

  @GetMapping(path = Array(""))
  def response: ResponseEntity[String] = {
    LOG.info("Getting session")
    ResponseEntity.ok("")
  }
}
