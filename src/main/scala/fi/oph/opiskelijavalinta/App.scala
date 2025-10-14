package fi.oph.opiskelijavalinta

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.servlet.config.annotation.{CorsRegistry, WebMvcConfigurer}

@SpringBootApplication
class App {

  //@Profile(Array("dev"))
  @Bean
  def corsConfigurer(): WebMvcConfigurer = new WebMvcConfigurer {
    override def addCorsMappings(registry: CorsRegistry): Unit = {
      registry.addMapping("/**").allowedOrigins("http://localhost:3000")
    }
  }
}

object App {
  @main
  def mainMethod(args: String*): Unit =
    main(args.toArray)

  def main(args: Array[String]): Unit =
    // swagger
    System.setProperty("springdoc.api-docs.path", "/openapi/v3/api-docs")
    System.setProperty("springdoc.swagger-ui.path", "/static/swagger-ui/index.html")
    System.setProperty("springdoc.swagger-ui.tagsSorter", "alpha")

    SpringApplication.run(classOf[App], args:_*)
}
