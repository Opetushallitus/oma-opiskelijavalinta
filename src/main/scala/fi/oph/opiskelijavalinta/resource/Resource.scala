package fi.oph.opiskelijavalinta.resource

import org.springframework.http.ResponseEntity
import org.springframework.web.servlet.view.RedirectView
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/login"))
@RestController
@CrossOrigin(Array("https://localhost:3000"))
class Resource {

  @GetMapping(path = Array(""))
  def login = RedirectView("https://localhost:3000/oma-opiskelijavalinta")
}
