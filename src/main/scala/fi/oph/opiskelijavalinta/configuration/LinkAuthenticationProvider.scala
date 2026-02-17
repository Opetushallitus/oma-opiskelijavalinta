package fi.oph.opiskelijavalinta.configuration

import org.slf4j.LoggerFactory
import org.springframework.security.authentication.{AuthenticationProvider, BadCredentialsException}
import org.springframework.security.core.{Authentication, AuthenticationException}
import org.springframework.security.core.authority.SimpleGrantedAuthority

import scala.jdk.CollectionConverters.*

class LinkAuthenticationException(message: String, cause: Throwable = null)
  extends AuthenticationException(message, cause) {

  def this(message: String) = this(message, null)
}

class LinkAuthenticationProvider(linkVerificationService: LinkVerificationService)
  extends org.springframework.security.authentication.AuthenticationProvider {

  private val LOG = org.slf4j.LoggerFactory.getLogger(classOf[LinkAuthenticationProvider])

  override def authenticate(authentication: org.springframework.security.core.Authentication)
  : org.springframework.security.core.Authentication = {

    val token = authentication.asInstanceOf[LinkAuthenticationToken].token
    LOG.info(s"Authenticating link token: $token")

    val verification = linkVerificationService.verify(token)

    if (!verification.exists || !verification.valid) {
      throw new LinkAuthenticationException("Invalid or expired token")
    }

    val meta = verification.metadata.getOrElse(
      throw new LinkAuthenticationException("Token valid but metadata missing")
    )
    
    val personOid = meta.personOid.getOrElse(
      throw new LinkAuthenticationException("Missing personOid in token metadata")
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