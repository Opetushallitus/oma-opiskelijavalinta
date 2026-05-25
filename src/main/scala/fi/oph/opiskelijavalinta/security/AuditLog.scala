package fi.oph.opiskelijavalinta.security

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.google.gson.{Gson, JsonArray, JsonParser}
import fi.oph.opiskelijavalinta.service.AuthorizationService
import fi.vm.sade.auditlog.*
import fi.vm.sade.javautils.http.HttpServletRequestUtils
import jakarta.servlet.http.HttpServletRequest
import org.ietf.jgss.Oid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder

import java.net.InetAddress

class AuditLog {}

object AuditLog {

  val LOG: Logger = LoggerFactory.getLogger(classOf[AuditLog])

  val mapper: ObjectMapper = {
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule())
    mapper.registerModule(new Jdk8Module())
    mapper
  }

  private lazy val audit = {
    new Audit(entry => LOG.info(entry), "oma-opiskelijavalinta", ApplicationType.OPPIJA)
  }

  def log(
    request: HttpServletRequest,
    targetFields: Map[String, String],
    operation: AuditOperation,
    entity: Option[Any]
  ): Unit = {
    audit.log(
      buildAuthenticatedUser(request),
      operation,
      buildTarget(targetFields),
      buildChanges(entity)
    )
  }

  def logUnauthenticated(
    request: HttpServletRequest,
    targetFields: Map[String, String],
    operation: AuditOperation,
    entity: Option[Any]
  ): Unit = {
    audit.log(
      buildUnauthenticatedUser(request),
      operation,
      buildTarget(targetFields),
      buildChanges(entity)
    )
  }

  private def buildTarget(targetFields: Map[String, String]): Target = {
    val targetBuilder = new Target.Builder()
    for ((key, value) <- targetFields)
      targetBuilder.setField(key, value)
    targetBuilder.build()
  }

  private def buildChanges(entity: Option[Any]): JsonArray = {
    val elements = new JsonArray()
    entity.foreach { value =>
      elements.add(
        JsonParser.parseString(
          mapper.writeValueAsString(value)
        )
      )
    }
    elements
  }

  private def buildAuthenticatedUser(request: HttpServletRequest): User = {
    val ip        = getInetAddress(request)
    val sessionId = getSessionId(request)
    val userAgent = getUserAgent(request)

    AuthorizationService.getPersonOid match {
      case Some(oid) =>
        new User(
          Oid(oid),
          ip,
          sessionId,
          userAgent
        )

      case None =>
        new User(
          ip,
          sessionId,
          userAgent
        )
    }
  }

  private def buildUnauthenticatedUser(
    request: HttpServletRequest
  ): User = {
    val ip        = getInetAddress(request)
    val userAgent = getUserAgent(request)
    new User(
      ip,
      getSessionId(request),
      userAgent
    )
  }

  private def getSessionId(request: HttpServletRequest): String =
    Option(request.getSession(false))
      .map(_.getId)
      .getOrElse("")

  def getUserAgent(request: HttpServletRequest): String =
    Option(request.getHeader("User-Agent"))
      .getOrElse("Tuntematon user agent")

  def getInetAddress(request: HttpServletRequest): InetAddress =
    InetAddress.getByName(HttpServletRequestUtils.getRemoteAddress(request))
}
