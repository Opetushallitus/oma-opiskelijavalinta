package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.model.HakemusmaksunMaksupaiva
import fi.oph.opiskelijavalinta.resource.ApiConstants.HAKEMUSMAKSU_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import fi.oph.opiskelijavalinta.service.{AuthorizationService, HakemusmaksuService}
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.Pattern
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{HttpStatus, ResponseEntity}
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.{GetMapping, PathVariable, RequestMapping, RestController}

import scala.util.{Failure, Success, Try}

@RequestMapping(path = Array(HAKEMUSMAKSU_PATH))
@Validated
@RestController
class HakemusmaksuResource @Autowired (
  hakemusmaksuService: HakemusmaksuService,
  authorizationService: AuthorizationService
) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[HakemusmaksuResource])

  /**
   * Palauttaa hakemuksen hakemusmaksun maksupäivän. Käyttöliittymä kutsuu tätä vasta, kun hakija avaa
   * maksetun hakemusmaksun tiedot, jotta maksut-palveluun ei kohdistu kutsuja jokaisella sivulatauksella.
   */
  @GetMapping(path = Array("/hakemus/{hakemusOid}/maksupaiva"))
  def getMaksupaiva(
    @Pattern(regexp = ValidationPatterns.OID_PATTERN) @PathVariable(required = true) hakemusOid: String,
    request: HttpServletRequest
  ): ResponseEntity[HakemusmaksunMaksupaiva] = {
    if (!authorizationService.hasAuthAccessToHakemus(hakemusOid)) {
      ResponseEntity.status(HttpStatus.FORBIDDEN).build
    } else {
      val oppijanumero = authorizationService.getPersonOid.get
      val maksu        = Try(hakemusmaksuService.getMaksu(oppijanumero, hakemusOid))
      // Haku kirjataan audit-lokiin myös silloin, kun se epäonnistuu, koska osa laskuista on voitu jo hakea
      AuditLog.log(
        request,
        Map("hakemusOid" -> hakemusOid) ++
          maksu.toOption.flatten.map(m => "maksanutHakemusOid" -> m.maksanutHakemusOid),
        AuditOperation.HaeHakemusmaksunMaksupaiva,
        None
      )
      maksu match {
        case Success(m) =>
          ResponseEntity.ok(HakemusmaksunMaksupaiva(m.map(_.maksupaiva.toString)))
        case Failure(e) =>
          LOG.error(s"Hakemuksen $hakemusOid hakemusmaksun maksupäivän haku epäonnistui: ${e.getMessage}", e)
          ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build
      }
    }
  }
}
