package fi.oph.opiskelijavalinta.resource

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.security.{AuditLog, AuditOperation}
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.servlet.view.RedirectView
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api"))
@RestController
class LoginController(@Value("${host.oppija:localhost:3777}") val hostOppija: String) {

  val LOG: Logger    = LoggerFactory.getLogger(classOf[LoginController])
  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  @GetMapping(path = Array("/login"))
  def login(request: HttpServletRequest): RedirectView = {
    AuditLog.log(request, Map.empty, AuditOperation.Login, None)
    val redirectUrl = s"https://$hostOppija/oma-opiskelijavalinta"
    LOG.debug(s"Redirecting to: $redirectUrl")
    new RedirectView(redirectUrl)
  }

}
