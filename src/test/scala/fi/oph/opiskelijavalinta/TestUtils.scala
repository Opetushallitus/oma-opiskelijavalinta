package fi.oph.opiskelijavalinta

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import org.springframework.security.core.authority.SimpleGrantedAuthority
import java.util

object TestUtils {
  val objectMapper: ObjectMapper =
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)
    mapper.registerModule(new JavaTimeModule())
    mapper.registerModule(new Jdk8Module()) // tämä on java.util.Optional -kenttiä varten
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
    mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
    mapper

  val oppijaUser: OppijaUser =
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    new OppijaUser(attributes, "testuser", authorities)
}
