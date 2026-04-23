package fi.oph.opiskelijavalinta.security

import fi.oph.opiskelijavalinta.resource.HakemuksetResource
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.security.cas.authentication.CasAssertionAuthenticationToken
import org.springframework.security.core.userdetails.{AuthenticationUserDetailsService, UserDetails}

import java.util.stream.Collectors
import scala.jdk.CollectionConverters.*

class OppijaUserDetails extends AuthenticationUserDetailsService[CasAssertionAuthenticationToken] {

  val LOG: Logger = LoggerFactory.getLogger(classOf[OppijaUserDetails])

  override def loadUserDetails(token: CasAssertionAuthenticationToken): UserDetails = {
    val principal               = token.getAssertion.getPrincipal
    val attrsJava               = principal.getAttributes
    val attrs: OppijaAttributes = attrsJava.asScala.view.mapValues {
      case null      => ""
      case s: String => s
      case other     => other.toString
    }.toMap
    val attributesAsString =
      attrs
        .map { case (k, v) => s"$k:$v" }
        .mkString("{", ", ", "}")
    LOG.info(s"Tunnistautuneen oppijan attribuutit: $attributesAsString")
    val personOid: Option[String] = attrs.get("personOid")
    val hetu: Option[String]      = attrs.get("nationalIdentificationNumber")
    new OppijaUser(attrs, hetu, personOid, principal.getName)
  }
}
