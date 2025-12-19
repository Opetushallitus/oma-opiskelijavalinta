package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.HakutoiveenTulos
import fi.oph.opiskelijavalinta.resource.ApiConstants.VALINTATULOS_PATH
import fi.oph.opiskelijavalinta.service.VTSService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

@RequestMapping(path = Array(VALINTATULOS_PATH))
@RestController
class ValintaTulosResource @Autowired (vtsService: VTSService) {

  @GetMapping(path = Array("/hakemus/{hakemusOid}/haku/{hakuOid}"))
  def getValinnantulokset(
    @PathVariable hakemusOid: String,
    @PathVariable hakuOid: String
  ): ResponseEntity[List[HakutoiveenTulos]] = {
    val result = vtsService.getValinnanTulokset(hakuOid, hakemusOid)
    ResponseEntity.ok(result.get.hakutoiveet)
  }
}
