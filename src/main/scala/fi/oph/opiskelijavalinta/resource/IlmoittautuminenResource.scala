package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.ILMOITTAUTUMINEN_PATH
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

case class IlmoittautuminenDTO(ilmoittautumisTila: String, hakuOid: String)

@RequestMapping(path = Array(ILMOITTAUTUMINEN_PATH))
@RestController
class IlmoittautuminenResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(
    @PathVariable hakemusOid: String,
    @PathVariable hakukohdeOid: String,
    @RequestBody ilmoittautuminen: IlmoittautuminenDTO
  ): ResponseEntity[String] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.doIlmoittautuminen(
        authorizationService.getPersonOid.get,
        hakemusOid,
        hakukohdeOid,
        ilmoittautuminen.hakuOid,
        ilmoittautuminen.ilmoittautumisTila
      )
      ResponseEntity.ok(result.get)
    }
  }
}
