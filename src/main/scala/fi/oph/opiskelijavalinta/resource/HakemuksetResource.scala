package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.HAKEMUKSET_PATH
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.HakemuksetEnriched
import fi.oph.opiskelijavalinta.service.{AuthorizationService, HakemuksetService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(HAKEMUKSET_PATH))
@RestController
class HakemuksetResource @Autowired (hakemuksetService: HakemuksetService, authorizationService: AuthorizationService) {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[HakemuksetEnriched] = {
    val personOid: Option[String] = authorizationService.getPersonOid
    val hakemukset                = hakemuksetService.getHakemukset(personOid.get)
    ResponseEntity.ok(hakemukset)
  }
}
