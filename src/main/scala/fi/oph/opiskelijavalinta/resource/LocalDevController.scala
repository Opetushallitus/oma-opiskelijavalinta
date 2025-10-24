package fi.oph.opiskelijavalinta.resource

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.context.annotation.Profile
import org.springframework.web.servlet.view.RedirectView
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@Profile(Array("dev"))
@RequestMapping(path = Array("/api"))
@RestController
class LocalDevController {

  val LOG: Logger = LoggerFactory.getLogger(classOf[LocalDevController])
  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  @GetMapping(path = Array("/login"))
  def login = {
    LOG.debug("redirect to frontend in local dev")
    RedirectView("https://localhost:3777/oma-opiskelijavalinta")
  }

}
