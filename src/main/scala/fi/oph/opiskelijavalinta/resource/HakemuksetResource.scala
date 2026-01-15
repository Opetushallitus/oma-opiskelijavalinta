package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.HAKEMUKSET_PATH
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.HakemuksetEnriched
import fi.oph.opiskelijavalinta.service.HakemuksetService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(HAKEMUKSET_PATH))
@RestController
class HakemuksetResource @Autowired (hakemuksetService: HakemuksetService) {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[HakemuksetEnriched] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String] = principal.attributes.get("personOid")
    val hakemukset                = hakemuksetService.getHakemukset(personOid.get)
    ResponseEntity.ok(hakemukset)
  }
}
