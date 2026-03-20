package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.VASTAANOTTO_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{
  AllowedVastaanottoTilaToiminto,
  AuthorizationService,
  VTSService,
  ViestiService
}
import jakarta.validation.constraints.{NotBlank, Pattern}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{PathVariable, PostMapping, RequestBody, RequestMapping, RestController}

@RequestMapping(path = Array(VASTAANOTTO_PATH))
@Validated
@RestController
class VastaanottoResource @Autowired (
  vtsService: VTSService,
  authorizationService: AuthorizationService,
  viestiService: ViestiService
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[VastaanottoResource]);

  @PostMapping(path = Array("/hakemus/{hakemusOid}/hakukohde/{hakukohdeOid}"))
  def doVastaanotto(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakukohdeOid: String,
    @RequestBody(required = true) vastaanottoDto: VastaanottoDTO,
    request: HttpServletRequest
  ): ResponseEntity[String] = {
    LOG.info(
      s"Tehdään vastaanottoa ${vastaanottoDto.vastaanotto} hakemukselle $hakemusOid ja hakutoiveelle $hakukohdeOid"
    )
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val result = vtsService.doVastaanotto(
        hakemusOid,
        hakukohdeOid,
        AllowedVastaanottoTilaToiminto.valueOf(vastaanottoDto.vastaanotto)
      )
      AuditLog.log(
        request,
        Map(
          "hakemusOid"   -> hakemusOid,
          "hakukohdeOid" -> hakukohdeOid
        ),
        AuditOperation.TallennaVastaanotto,
        Some(vastaanottoDto.vastaanotto)
      )
      viestiService.lahetaVastaanottoViesti(
        hakukohdeOid,
        hakemusOid,
        vastaanottoDto.hakuOid,
        vastaanottoDto.vastaanottoKaannosAvain
      )
      AuditLog.log(
        request,
        Map(
          "hakemusOid"   -> hakemusOid,
          "hakukohdeOid" -> hakukohdeOid
        ),
        AuditOperation.LahetaVastaanottoviesti,
        None
      )
      ResponseEntity.ok(result.get)
    }
  }
}
