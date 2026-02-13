package fi.oph.opiskelijavalinta.configuration

import org.springframework.security.authentication.{AuthenticationProvider, BadCredentialsException}
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority

import scala.jdk.CollectionConverters.*

class LinkAuthenticationProvider(linkVerificationService: LinkVerificationService)
  extends AuthenticationProvider {

  override def authenticate(authentication: Authentication): Authentication = {
    val token = authentication.asInstanceOf[LinkAuthenticationToken].token

    // Verify the token
    val verification = linkVerificationService.verify(token)

    if (!verification.exists || !verification.valid) {
      throw new BadCredentialsException("Invalid or expired token")
    }

    val meta = verification.metadata.getOrElse(
      throw new BadCredentialsException("Token valid but metadata missing")
    )
    
    val personOid = meta.personOid.getOrElse(
      throw new BadCredentialsException("Missing personOid in token metadata")
    )
    val hakemusOid = meta.hakemusOid

    val attrs = Map(
      "personOid" -> personOid,
      "hakemusOid" -> hakemusOid,
      "hakuOid" -> meta.hakuOid.getOrElse("")
    )
    
    val principal = new OppijaUser(
      attributes = attrs,
      username = personOid
    )

    // tällä voi rajata myöhemmin apeissa
    val authorities = List(new SimpleGrantedAuthority("ROLE_LINK_USER")).asJava
    
    val authToken = new LinkAuthenticationToken(token, authorities)
    authToken.setPrincipal(principal)
    authToken.setAuthenticated(true)

    authToken
  }

  override def supports(authentication: Class[_]): Boolean =
    classOf[LinkAuthenticationToken].isAssignableFrom(authentication)
}