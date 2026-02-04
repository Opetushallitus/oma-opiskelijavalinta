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
    operaatio: AuditOperation,
    entity: Option[Any]
  ): Unit =
    val target = new Target.Builder()
    for ((key, value) <- targetFields)
      target.setField(key, value)
    val elements: JsonArray = new JsonArray()
    if (entity.isDefined)
      elements.add(JsonParser.parseString(mapper.writeValueAsString(entity.get)))
    audit.log(getUser(request), operaatio, target.build(), elements)

  def getUser(request: HttpServletRequest): User =
    val userOid = AuthorizationService.getPersonOid
    val ip      = getInetAddress(request)
    new User(
      new Oid(userOid.get),
      ip,
      request.getSession(false).getId,
      Option(request.getHeader("User-Agent")).getOrElse("Tuntematon user agent")
    )

  def getInetAddress(request: HttpServletRequest): InetAddress =
    InetAddress.getByName(HttpServletRequestUtils.getRemoteAddress(request))
}
