package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.resource.ApiConstants.HAKEMUKSET_PATH
import fi.oph.opiskelijavalinta.model.{HakemuksetEnriched, HakemusEnriched}
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation, OppijaUser}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, HakemuksetService, VTSService}
import fi.oph.opiskelijavalinta.util.{LogHakemus, LogUtil}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(HAKEMUKSET_PATH))
@RestController
class HakemuksetResource @Autowired (
  hakemuksetService: HakemuksetService,
  authorizationService: AuthorizationService,
  vtsService: VTSService
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuksetResource]);

  @GetMapping(path = Array(""))
  def response(request: HttpServletRequest): ResponseEntity[HakemuksetEnriched] = {
    val personOid: Option[String] = authorizationService.getPersonOid
    val linkUser                  = authorizationService.hasLinkUserRole
    LOG.info(s"Haetaan hakemukset${if (linkUser) " linkillä tunnistautuneelle" else ""} oppijalle: $personOid")
    var hakemukset = hakemuksetService.getHakemukset(personOid.get)
    AuditLog.log(request, Map.empty, AuditOperation.HaeHakemukset, None)
    if (linkUser) {
      val hakemusOid      = authorizationService.getHakemusOidFromLinkUser
      val currentFiltered = hakemukset.current
        .filter(h => h.oid.equals(hakemusOid.getOrElse("")))
        .map(h => mapTuloksetWithJwtsForLinkUser(h, personOid.get))
      val oldFiltered = hakemukset.old.filter(h => h.oid.equals(hakemusOid.getOrElse("")))
      hakemukset = HakemuksetEnriched(currentFiltered, oldFiltered)
    }
    LOG.info(
      s"Haettu hakemukset valinnan tila tiedoilla: ${(hakemukset.current ++ hakemukset.old).map(h => LogHakemus(h.oid, h.hakemuksenTulokset.map(LogUtil.toValintaTulos)).toString).foldLeft("")((a, b) => String.join("\n", a, b))}"
    )
    ResponseEntity.ok(hakemukset)
  }

  private def mapTuloksetWithJwtsForLinkUser(hakemus: HakemusEnriched, hakijaOid: String): HakemusEnriched = {
    hakemus.copy(hakemuksenTulokset =
      hakemus.hakemuksenTulokset.map(ht => vtsService.addJwtsForLinkUserIfNecessary(hakijaOid, ht))
    )
  }

}
