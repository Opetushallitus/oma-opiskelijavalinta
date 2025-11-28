package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.APPLICATIONS_PATH
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.ApplicationsEnriched
import fi.oph.opiskelijavalinta.service.ApplicationsService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(APPLICATIONS_PATH))
@RestController
class ApplicationsResource @Autowired (applicationService: ApplicationsService) {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[ApplicationsEnriched] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String] = principal.attributes.get("personOid")
    val applications = applicationService.getApplications(personOid.get)
    ResponseEntity.ok(applications)
  }
}
