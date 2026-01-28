package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.VASTAANOTTO_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import jakarta.validation.constraints.{NotBlank, Pattern}
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

@RequestMapping(path = Array(VASTAANOTTO_PATH))
@Validated
@RestController
class VastaanottoResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakukohdeOid: String,
    @NotBlank @RequestBody(required = true) vastaanotto: String,
    request: HttpServletRequest
  ): ResponseEntity[String] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.doVastaanotto(hakemusOid, hakukohdeOid, vastaanotto)
      AuditLog.log(
        request,
        Map(
          "hakemusOid"   -> hakemusOid,
          "hakukohdeOid" -> hakukohdeOid,
          "vastaanotto"  -> vastaanotto
        ),
        AuditOperation.TallennaVastaanotto,
        result
      )
      ResponseEntity.ok(result.get)
    }
  }
}
