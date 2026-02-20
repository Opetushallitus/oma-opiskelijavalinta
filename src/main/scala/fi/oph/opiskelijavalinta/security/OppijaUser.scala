package fi.oph.opiskelijavalinta.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

import java.util.Collection
import scala.jdk.CollectionConverters.*

type OppijaAttributes = Map[String, String]

final class OppijaUser(
  val attributes: OppijaAttributes,
  private val username: String,
  private val authorities: Collection[_ <: GrantedAuthority] = java.util.Collections.emptyList()
) extends UserDetails {

  override def getAuthorities: Collection[_ <: GrantedAuthority] = authorities

  override def getPassword: String = null

  override def getUsername: String = username

  override def isAccountNonExpired: Boolean = true

  override def isAccountNonLocked: Boolean = true

  override def isCredentialsNonExpired: Boolean = true

  override def isEnabled: Boolean = true

  def getAttributes: java.util.Map[String, String] = attributes.asJava
}
