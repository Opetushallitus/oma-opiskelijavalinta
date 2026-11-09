package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.clients.VtsBadRequestException
import fi.oph.opiskelijavalinta.dto.IlmoittautuminenDTO
import fi.oph.opiskelijavalinta.resource.ApiConstants.ILMOITTAUTUMINEN_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, VTSService}
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.Pattern
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

@RequestMapping(path = Array(ILMOITTAUTUMINEN_PATH))
@Validated
@RestController
class IlmoittautuminenResource @Autowired (vtsService: VTSService, authorizationService: AuthorizationService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[IlmoittautuminenResource]);

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doIlmoittautuminen(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakukohdeOid: String,
    @RequestBody(required = true) ilmoittautuminen: IlmoittautuminenDTO,
    request: HttpServletRequest
  ): ResponseEntity[String] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      try {
        val result = vtsService.doIlmoittautuminen(
          hakemusOid,
          hakukohdeOid,
          ilmoittautuminen.ilmoittautumisTila
        )
        AuditLog.log(
          request,
          Map(
            "hakemusOid"   -> hakemusOid,
            "hakukohdeOid" -> hakukohdeOid
          ),
          AuditOperation.TallennaIlmoittautuminen,
          Some(ilmoittautuminen)
        )
        ResponseEntity.ok(result.get)
      } catch {
        // virheet lokitetaan stacktraceineen VTSServicessä, tässä riittää lyhyt viesti
        case e: VtsBadRequestException =>
          LOG.error(
            "Ilmoittautumisen tallentaminen epäonnistui, hakemusOid: {}, hakukohdeOid: {}, virhe: {}",
            hakemusOid,
            hakukohdeOid,
            e.getMessage
          )
          ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ilmoittautuminen.virhe")
        case e: Exception =>
          LOG.error(
            "Ilmoittautumisen tallentaminen epäonnistui, hakemusOid: {}, hakukohdeOid: {}, virhe: {}",
            hakemusOid,
            hakukohdeOid,
            e.getMessage
          )
          ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ilmoittautuminen.virhe")
      }
    }
  }
}
