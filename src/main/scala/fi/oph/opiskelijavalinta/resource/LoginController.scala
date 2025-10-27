package fi.oph.opiskelijavalinta.resource

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.web.servlet.view.RedirectView
import org.springframework.web.bind.annotation.{GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api"))
@RestController
class LoginController {

  val LOG: Logger = LoggerFactory.getLogger(classOf[LoginController])
  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  @GetMapping(path = Array("/login"))
  def login(): RedirectView = {
    // get DOMAIN env variable, fallback to localhost:3404 for dev if missing
    val domain = sys.env.getOrElse("host_oppija", "localhost:3404")
    val redirectUrl = s"https://$domain/oma-opiskelijavalinta"

    LOG.debug(s"Redirecting to: $redirectUrl")
    new RedirectView(redirectUrl)
  }

}
