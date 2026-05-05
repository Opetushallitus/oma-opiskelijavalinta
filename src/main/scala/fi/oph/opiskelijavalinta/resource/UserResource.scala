package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.service.OnrService
import fi.oph.opiskelijavalinta.resource.ApiConstants.USER_PATH
import fi.oph.opiskelijavalinta.security.OppijaUser
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(USER_PATH))
@RestController
class UserResource @Autowired (private val onrService: OnrService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[UserResource]);

  @GetMapping(path = Array(""))
  def response: ResponseEntity[Oppija] = {
    LOG.info("Haetaan käyttäjän tiedot")
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String] = principal.personOid
    val hetu: Option[String]      = principal.hetu
    val oppija                    = (personOid, hetu) match
      case (Some(personOid), _) => onrService.getPersonInfo(personOid)
      case (None, Some(hetu))   => onrService.getPersonInfoByHetu(hetu)
      case _                    => null // TODO eidas-tunniste
    ResponseEntity.ok(oppija)
  }
}
