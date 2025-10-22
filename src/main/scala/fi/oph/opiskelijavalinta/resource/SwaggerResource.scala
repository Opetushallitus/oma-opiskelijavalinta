package fi.oph.opiskelijavalinta.resource

import io.swagger.v3.oas.annotations.Hidden
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.web.bind.annotation.*

@RequestMapping(path = Array("/swagger"))
@RestController
@Hidden
class SwaggerResource {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[SwaggerResource]);

  @GetMapping(path = Array(""))
  def redirect(response: HttpServletResponse): Unit =
    LOG.info("uudelleenohjaus swaggeriin")
    response.sendRedirect("/static/swagger-ui/index.html")
}