package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.security.OppijaUser
import fi.oph.opiskelijavalinta.security.Authorities
import fi.oph.opiskelijavalinta.service.AuthorizationService.getPersonOid
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

object AuthorizationService {
  def getPersonOid: Option[String] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    principal.attributes.get("personOid")
  }
}

@Service
class AuthorizationService @Autowired (hakemuksetService: HakemuksetService) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuksetService]);

  export AuthorizationService.getPersonOid

  def hasAuthAccessToHakemus(hakemusOid: String): Boolean = {
    val oppijanumero = getPersonOid
    val hakemukset   = hakemuksetService.getHakemusOids(oppijanumero.get)
    hakemukset
      .find(oid => oid.equals(hakemusOid))
      .fold {
        LOG.warn(s"Autorisoimaton pyyntö hakemukselle $hakemusOid käyttäjältä $oppijanumero")
        false
      }(_ => true)
  }

  def hasLinkUserRole: Boolean = {
    SecurityContextHolder.getContext.getAuthentication.getAuthorities.stream
      .anyMatch(a => a.getAuthority.equals(Authorities.ROLE_LINK_USER))
  }

  def getHakemusOidFromLinkUser: Option[String] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    principal.attributes.get("hakemusOid")
  }
}
