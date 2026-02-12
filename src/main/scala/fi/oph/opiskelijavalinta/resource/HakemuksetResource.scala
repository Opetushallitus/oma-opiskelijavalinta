package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.HAKEMUKSET_PATH
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.HakemuksetEnriched
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, HakemuksetService}
import fi.oph.opiskelijavalinta.util.{LogHakemus, LogUtil}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(HAKEMUKSET_PATH))
@RestController
class HakemuksetResource @Autowired (hakemuksetService: HakemuksetService, authorizationService: AuthorizationService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuksetResource]);

  @GetMapping(path = Array(""))
  def response(request: HttpServletRequest): ResponseEntity[HakemuksetEnriched] = {
    val personOid: Option[String] = authorizationService.getPersonOid
    LOG.info(s"Haetaan hakemukset oppijalle: $personOid")
    val hakemukset = hakemuksetService.getHakemukset(personOid.get)
    AuditLog.log(request, Map.empty, AuditOperation.HaeHakemukset, None)
    LOG.info(
      s"Haettu hakemukset valinnan tila tiedoilla: ${(hakemukset.current ++ hakemukset.old).map(h => LogHakemus(h.oid, h.hakemuksenTulokset.map(LogUtil.toValintaTulos)).toString).foldLeft("")((a, b) => String.join("\n", a, b))}"
    )
    ResponseEntity.ok(hakemukset)
  }
}
