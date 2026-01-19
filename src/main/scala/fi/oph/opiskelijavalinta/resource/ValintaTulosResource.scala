package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.HakutoiveenTulos
import fi.oph.opiskelijavalinta.resource.ApiConstants.VALINTATULOS_PATH
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

@RequestMapping(path = Array(VALINTATULOS_PATH))
@RestController
class ValintaTulosResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  @GetMapping(path = Array("/hakemus/{hakemusOid}/haku/{hakuOid}"))
  def getValinnantulokset(
    @PathVariable hakemusOid: String,
    @PathVariable hakuOid: String
  ): ResponseEntity[List[HakutoiveenTulos]] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.getValinnanTulokset(hakuOid, hakemusOid)
      ResponseEntity.ok(result.get.hakutoiveet)
    }
  }
}
