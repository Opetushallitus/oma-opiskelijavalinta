package fi.oph.opiskelijavalinta.configuration

import org.springframework.security.authentication.{AuthenticationProvider, BadCredentialsException}
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority

import scala.jdk.CollectionConverters.*

class LinkAuthenticationProvider(linkVerificationService: LinkVerificationService)
  extends AuthenticationProvider {

  override def authenticate(authentication: Authentication): Authentication = {
    val authToken = authentication.asInstanceOf[LinkAuthenticationToken]
    val token = authToken.token

    // TODO OPHYOS-77, toistaiseksi fake-toteutus
    val verification = linkVerificationService.verify(token)

    if (!verification.exists || !verification.valid) {
      throw new BadCredentialsException("Invalid or expired token")
    }

    val meta = verification.metadata.getOrElse(
      throw new BadCredentialsException("No Oppija metadata found in token")
    )
    
    val personOid = meta.personOid.getOrElse(
      throw new BadCredentialsException("No personOid on token metadata")
    )

    val hakemusOid = meta.hakemusOid
    if (hakemusOid.isEmpty)
      throw new BadCredentialsException("No hakemusOid on token metadata")
    
    val attrs = Map(
      "personOid" -> personOid,
      "hakemusOid" -> meta.hakemusOid,
      "hakuOid" -> meta.hakuOid.getOrElse("")
    ).filter(_._2.nonEmpty)

    val principal = new OppijaUser(
      attributes = attrs,
      username = personOid,
      authorities = List(new SimpleGrantedAuthority("ROLE_LINK_USER")).asJava
    )
    
    authToken.setPrincipal(principal)
    authToken.setAuthenticated(true)
    authToken.setAuthorities(principal.getAuthorities)

    authToken
  }

  override def supports(authentication: Class[_]): Boolean =
    classOf[LinkAuthenticationToken].isAssignableFrom(authentication)
}