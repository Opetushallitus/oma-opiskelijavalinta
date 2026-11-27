package fi.oph.opiskelijavalinta.configuration

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.springframework.context.annotation.Configuration
import org.springframework.http.converter.HttpMessageConverters
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

import scala.annotation.nowarn

@Configuration
class JacksonConfig extends WebMvcConfigurer {

  // Sovellus käyttää toistaiseksi Jackson 2:ta (Spring Boot 4:n oletus on Jackson 3), joten korvataan
  // oletus-JSON-konvertteri Jackson 2 -pohjaisella. MappingJackson2HttpMessageConverter on deprekoitu
  // ja poistuu, kun sovellus siirretään Jackson 3:een.
  @nowarn("cat=deprecation")
  override def configureMessageConverters(builder: HttpMessageConverters.ServerBuilder): Unit =
    val mapper = ObjectMapper()
    mapper.registerModule(new JavaTimeModule())
    mapper.registerModule(new Jdk8Module())
    mapper.registerModule(DefaultScalaModule)
    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
    builder.withJsonConverter(MappingJackson2HttpMessageConverter(mapper))
}
