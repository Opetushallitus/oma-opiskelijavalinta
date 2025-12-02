package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.clients.OnrClient
import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/user"))
@RestController
class UserResource @Autowired (private val onrClient: OnrClient) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[SessionResource]);

  @GetMapping(path = Array(""))
  def response: ResponseEntity[Oppija] = {
    LOG.info("Getting User details")
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String] = principal.attributes.get("personOid")
    val hetu: Option[String]      = principal.attributes.get("nationalIdentificationNumber")
    val oppija                    = (personOid, hetu) match
      case (Some(personOid), _) => onrClient.getPersonInfo(personOid)
      case (None, Some(hetu))   => onrClient.getPersonInfoByHetu(hetu)
      case _ => null // TODO: käsittele tapaukset ilman hetua tai kun on heikko tunnistautuminen käytössä
    ResponseEntity.ok(oppija)
  }
}
