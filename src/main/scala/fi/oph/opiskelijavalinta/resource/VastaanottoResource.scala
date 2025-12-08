package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.VASTAANOTTO_PATH
import fi.oph.opiskelijavalinta.service.VTSService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{PathVariable, RequestBody, PostMapping, RequestMapping, RestController}

@RequestMapping(path = Array(VASTAANOTTO_PATH))
@RestController
class VastaanottoResource @Autowired (vtsService: VTSService) {

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(@PathVariable hakemusOid: String, @PathVariable hakukohdeOid: String, @RequestBody vastaanotto: String): ResponseEntity[String] = {
    val result = vtsService.doVastaanotto(hakemusOid, hakukohdeOid, vastaanotto)
    ResponseEntity.ok(result.get)
  }
}
