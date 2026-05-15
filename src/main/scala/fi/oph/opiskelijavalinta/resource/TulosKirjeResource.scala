package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.TULOSKIRJE_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation, LinkAuthenticationException}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, LinkVerificationService, TuloskirjeService, VTSService}
import jakarta.servlet.http.{HttpServletRequest, HttpServletResponse}
import jakarta.validation.constraints.Pattern
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.{HttpStatus, MediaType, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}
import org.springframework.web.servlet.view.RedirectView

import java.nio.charset.StandardCharsets

@RequestMapping(path = Array(TULOSKIRJE_PATH))
@Validated
@RestController
class TulosKirjeResource @Autowired (
  @Value("${host.oppija:localhost:3777}") val hostOppija: String,
  kirjeService: TuloskirjeService,
  authorizationService: AuthorizationService,
  linkVerificationService: LinkVerificationService
) {

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

  @GetMapping(path = Array("/token/{token}"))
  def getTuloskirjeWithToken(
    @PathVariable(required = true) token: String,
    request: HttpServletRequest
  ): ResponseEntity[String] | RedirectView = {
    LOG.info(s"Haetaan tuloskirje oppijan-tunnistus tokenilla")

    if (token == null || token.trim.isEmpty) {
      LOG.warn("tuloskirjeen latauksesta puuttui kirjautumistoken")
      return ResponseEntity
        .badRequest()
        .body("tuloskirjeen latauksesta puuttui kirjautumistoken")
    }
    try {
      val verification = linkVerificationService
        .verify(token)
        .getOrElse(
          throw new LinkAuthenticationException("tuloskirjeen kirjautumistokenin data puuttuu")
        )

      if (!verification.exists || !verification.valid) {
        throw new LinkAuthenticationException(
          "virheellinen tai vanhentunut tuloskirjeen kirjautumistoken"
        )
      }

      val meta = verification.metadata.getOrElse(
        throw new LinkAuthenticationException("tuloskirjeen kirjautumistokenin metadata puuttuu")
      )
      val hakuOid = meta.hakuOid.getOrElse(
        throw new LinkAuthenticationException("haun oid puuttuu tuloskirjeen kirjautumistokenin metadatasta")
      )
      val hakemusOid = meta.hakemusOid

      val result = kirjeService.getTuloskirje(hakuOid, hakemusOid)
      AuditLog.logUnauthenticated(
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
          ResponseEntity
            .ok()
            .contentType(MediaType.parseMediaType("text/html;charset=UTF-8"))
            .body(new String(data, StandardCharsets.UTF_8))
        case None =>
          LOG.info(s"Tuloskirjeen haku hakemukselle $hakemusOid ja haulla $hakuOid epäonnistui")
          ResponseEntity.notFound.build
      }
    } catch {
      case ex: LinkAuthenticationException =>
        LOG.error(s"Virhe tuloskirjeen latauksessa, token: $token", ex.getMessage)
        val linkErrorUrl = s"https://$hostOppija/oma-opiskelijavalinta/link-error"
        new RedirectView(linkErrorUrl)
      case e: Exception =>
        LOG.error(
          s"Virhe tuloskirjeen latauksessa, token: $token",
          e
        )
        val errorUrl = s"https://$hostOppija/oma-opiskelijavalinta/error"
        new RedirectView(errorUrl)
    }
  }
}
