package fi.oph.opiskelijavalinta.configuration

import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken
import org.springframework.security.core.userdetails.{AuthenticationUserDetailsService, UserDetails}
import scala.jdk.CollectionConverters._

class OppijaUserDetails extends AuthenticationUserDetailsService[CasAssertionAuthenticationToken] {

  override def loadUserDetails(token: CasAssertionAuthenticationToken): UserDetails = {
    val principal = token.getAssertion.getPrincipal
    val attrsJava = principal.getAttributes
    val attrs: OppijaAttributes = attrsJava.asScala.view.mapValues {
      case null => ""
      case s: String => s
      case other => other.toString
    }.toMap
    new OppijaUser(attrs, principal.getName)
  }
}