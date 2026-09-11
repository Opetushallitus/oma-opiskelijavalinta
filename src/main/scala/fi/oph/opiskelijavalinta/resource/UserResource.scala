package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.service.OnrService
import fi.oph.opiskelijavalinta.resource.ApiConstants.USER_PATH
import fi.oph.opiskelijavalinta.security.{AuditLog, OppijaAttributes, OppijaUser}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array(USER_PATH))
@RestController
class UserResource @Autowired (private val onrService: OnrService) {

  val LOG: Logger = LoggerFactory.getLogger(classOf[UserResource]);

  @GetMapping(path = Array(""))
  def response(request: HttpServletRequest): ResponseEntity[Oppija] = {
    LOG.info("Haetaan käyttäjän tiedot")
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    val personOid: Option[String]     = principal.personOid
    val hetu: Option[String]          = principal.hetu
    val oppijaOnrista: Option[Oppija] = (personOid, hetu) match
      case (Some(personOid), _) => onrService.getPersonInfo(personOid)
      case (None, Some(hetu))   => onrService.getPersonInfoByHetu(hetu)
      case _                    => // TODO eidas-tunniste
        val userAgent = AuditLog.getUserAgent(request)
        val ipAddress = AuditLog.getInetAddress(request)
        LOG.info(
          s"Kirjautunut käyttäjä jolla ei ole oppijanumeroa eikä hetua. Käyttäjän attribuutit cas-oppijasta: ${principal.attributes}," +
            s"userAgent: $userAgent, ipAddress: $ipAddress"
        )
        None
    val oppija: Option[Oppija] = oppijaOnrista.orElse(oppijaAttribuuteista(principal.attributes))
    oppija match
      case Some(o) => ResponseEntity.ok(o)
      case None    => ResponseEntity.noContent().build[Oppija]()
  }

  // Suomi.fi-tunnistautumisessa (mm. eidas-tunniste) nimitiedot saadaan cas-oppijan välittämistä
  // tunnistautumisattribuuteista, vaikka oppijaa ei löytyisikään oppijanumerorekisteristä.
  private def oppijaAttribuuteista(attributes: OppijaAttributes): Option[Oppija] = {
    val etunimi  = attributes.get("firstName")
    val sukunimi = attributes.get("familyName")
    LOG.info(
      s"Yritetään muodostaa oppija attribuuteista, etunimi: $etunimi, sukunimi: $sukunimi, kaikki attribuutit: $attributes"
    )
    (etunimi, sukunimi) match
      case (None, None) => None
      case _            =>
        Some(
          Oppija(
            oppijanumero = "",
            syntymaaika = "",
            kutsumanimi = etunimi.getOrElse(""),
            sukunimi = sukunimi.getOrElse("")
          )
        )
  }
}
