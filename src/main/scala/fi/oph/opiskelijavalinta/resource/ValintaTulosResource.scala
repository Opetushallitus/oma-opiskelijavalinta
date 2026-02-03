package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.HakutoiveenTulos
import fi.oph.opiskelijavalinta.resource.ApiConstants.VALINTATULOS_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditObjects, AuditOperation, AuditValintaTulos}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import jakarta.validation.constraints.Pattern
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

@RequestMapping(path = Array(VALINTATULOS_PATH))
@Validated
@RestController
class ValintaTulosResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[ValintaTulosResource]);

  @GetMapping(path = Array("/hakemus/{hakemusOid}/haku/{hakuOid}"))
  def getValinnantulokset(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakuOid: String,
    request: HttpServletRequest
  ): ResponseEntity[List[HakutoiveenTulos]] = {
    LOG.info(s"Haetaan valintatuloksia hakemuksella $hakemusOid ja haulla $hakuOid")
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.getValinnanTulokset(hakuOid, hakemusOid)
      AuditLog.log(
        request,
        Map(
          "hakemusOid" -> hakemusOid,
          "hakuOid"    -> hakuOid
        ),
        AuditOperation.HaeValintaTulokset,
        result.map(ht => ht.hakutoiveet.map(AuditObjects.toValintaTulos))
      )
      ResponseEntity.ok(result.get.hakutoiveet)
    }
  }
}
