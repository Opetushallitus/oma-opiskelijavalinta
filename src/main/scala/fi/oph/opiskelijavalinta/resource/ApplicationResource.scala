package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.Application
import fi.oph.opiskelijavalinta.service.ApplicationService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/application"))
@RestController
class ApplicationResource @Autowired (applicationService: ApplicationService) {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[Seq[Application]] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String] = principal.attributes.get("personOid")
    val applications = applicationService.getApplications(personOid.get)
    ResponseEntity.ok(applications)
  }
}
