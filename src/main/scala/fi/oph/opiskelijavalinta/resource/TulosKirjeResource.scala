package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.HakutoiveenTulosEnriched
import fi.oph.opiskelijavalinta.resource.ApiConstants.TULOSKIRJE_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, TuloskirjeService, VTSService}
import fi.oph.opiskelijavalinta.util.LogUtil
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.Pattern
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpEntity, HttpStatus, MediaType, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

@RequestMapping(path = Array(TULOSKIRJE_PATH))
@Validated
@RestController
class TulosKirjeResource @Autowired (kirjeService: TuloskirjeService, authorizationService: AuthorizationService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[TulosKirjeResource]);

  @GetMapping(path = Array("/haku/{hakuOid}/hakemus/{hakemusOid}"))
  def getTuloskirje(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakuOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    request: HttpServletRequest
  ): ResponseEntity[String] = {
    LOG.info(s"Haetaan tuloskirje hakemuksella $hakemusOid ja haulla $hakuOid")
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = kirjeService.getTuloskirje(hakuOid, hakemusOid)
      AuditLog.log(
        request,
        Map(
          "hakemusOid" -> hakemusOid,
          "hakuOid"    -> hakuOid
        ),
        AuditOperation.HaeTulosKirje,
        None
      )
      result match {
        case Some(data) =>
          LOG.info(s"Tuloskirje haettu hakemuksella $hakemusOid ja haulla $hakuOid")
          ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(String(data))
        case None =>
          LOG.info(s"Tuloskirjeen haku $hakemusOid ja haulla $hakuOid epäonnistui")
          ResponseEntity.notFound.build
      }
    }
  }
}
