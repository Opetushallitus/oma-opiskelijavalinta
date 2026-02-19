package fi.oph.opiskelijavalinta.resource

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class FrontendPathController {

  @GetMapping("/**")
  def forward(request: HttpServletRequest): String = {
    val path = request.getRequestURI
    if (path.startsWith("/api") || path.startsWith("/assets") || path.startsWith("/js") || path == "/index.html")
      path // Let Spring handle normally
    else
      "forward:/index.html"
  }
}
