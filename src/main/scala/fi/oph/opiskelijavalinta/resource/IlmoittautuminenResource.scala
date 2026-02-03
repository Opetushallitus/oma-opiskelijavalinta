package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.dto.IlmoittautuminenDTO
import fi.oph.opiskelijavalinta.resource.ApiConstants.ILMOITTAUTUMINEN_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.Pattern
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

@RequestMapping(path = Array(ILMOITTAUTUMINEN_PATH))
@Validated
@RestController
class IlmoittautuminenResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakukohdeOid: String,
    @RequestBody(required = true) ilmoittautuminen: IlmoittautuminenDTO,
    request: HttpServletRequest
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
      AuditLog.log(
        request,
        Map(
          "hakemusOid"         -> hakemusOid,
          "hakukohdeOid"       -> hakukohdeOid,
          "ilmoittautumistila" -> ilmoittautuminen.ilmoittautumisTila.toString
        ),
        AuditOperation.TallennaIlmoittautuminen,
        None
      )
      ResponseEntity.ok(result.get)
    }
  }
}
