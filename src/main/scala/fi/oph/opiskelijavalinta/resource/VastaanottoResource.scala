package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.VASTAANOTTO_PATH
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

@RequestMapping(path = Array(VASTAANOTTO_PATH))
@RestController
class VastaanottoResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(
    @PathVariable hakemusOid: String,
    @PathVariable hakukohdeOid: String,
    @RequestBody vastaanotto: String
  ): ResponseEntity[String] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.doVastaanotto(hakemusOid, hakukohdeOid, vastaanotto)
      ResponseEntity.ok(result.get)
    }
  }
}
