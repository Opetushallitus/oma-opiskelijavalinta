package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.SESSION_PATH
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(SESSION_PATH))
@RestController
class SessionResource {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SessionResource]);

  @GetMapping(path = Array(""))
  def response: ResponseEntity[String] = {
    LOG.info("Getting session")
    ResponseEntity.ok("ok")
  }
}
