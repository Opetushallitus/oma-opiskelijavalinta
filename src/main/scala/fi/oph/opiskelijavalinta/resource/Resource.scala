package fi.oph.opiskelijavalinta.resource

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.http.ResponseEntity
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.servlet.view.RedirectView
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api"))
@RestController
class Resource {

  val LOG: Logger = LoggerFactory.getLogger(classOf[Resource])
  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  @GetMapping(path = Array("/login"))
  def login = {
    LOG.info("Redirecting to frontend")
    RedirectView("https://localhost:3404/oma-opiskelijavalinta")
  }

}
