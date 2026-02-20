package fi.oph.opiskelijavalinta.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.GrantedAuthority

class LinkAuthenticationToken(
  val token: String,
  authorities: java.util.Collection[_ <: GrantedAuthority]
) extends AbstractAuthenticationToken(authorities) {

  private var principal: AnyRef = _

  def this(token: String) =
    this(token, java.util.Collections.emptyList())

  override def getCredentials: AnyRef = token

  override def getPrincipal: AnyRef = principal

  def setPrincipal(p: AnyRef): Unit =
    this.principal = p
}
