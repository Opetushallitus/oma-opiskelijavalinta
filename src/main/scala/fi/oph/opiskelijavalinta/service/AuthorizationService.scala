package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.configuration.OppijaUser
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AuthorizationService @Autowired (hakemuksetService: HakemuksetService) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[HakemuksetService]);

  def getPersonOid: Option[String] = {
    val principal: OppijaUser = SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[OppijaUser]
    principal.attributes.get("personOid")
  }

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
}
