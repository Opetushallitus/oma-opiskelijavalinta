package fi.oph.opiskelijavalinta.resource

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, RequestMapping, RestController}

@RequestMapping(path = Array("/api/session"))
@RestController
@CrossOrigin(Array("http://localhost:3404"))
class SessionResource {

  @GetMapping(path = Array(""))
  def response: ResponseEntity[String] = {
    System.out.println("HERE");
    ResponseEntity.ok("")
  }
}
