package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.Application
import fi.oph.opiskelijavalinta.service.ApplicationService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/application"))
@RestController
class ApplicationResource @Autowired (applicationService: ApplicationService) {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[List[Application]] = {
    ResponseEntity.ok(applicationService.getApplications("test"))
  }
}
