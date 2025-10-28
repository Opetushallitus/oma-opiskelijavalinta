package fi.oph.opiskelijavalinta

import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.PostgreSQLContainer

import scala.jdk.CollectionConverters.SeqHasAsJava

@ActiveProfiles(Array("dev"))
object DevApp {

  private val postgres: PostgreSQLContainer[_] = new PostgreSQLContainer("postgres:17")

  private def startContainers(): Unit =
    postgres.withUsername("app")
    postgres.withPassword("app")
    postgres.setPortBindings(List("55455:5432").asJava)
    postgres.start()

  @main
  def mainMethod(args: String*): Unit =
    main(args.toArray)

  def main(args: Array[String]): Unit =
    //System.setProperty("spring.profiles.active", "dev")

    if (!sys.env.getOrElse("NO_DB", "false").equalsIgnoreCase("true")) {
      startContainers()
    }

    // cas-configuraatio
    System.setProperty("cas-service.service", sys.env.getOrElse("CAS_SERVICE_URL", "https://localhost:8555/oma-opiskelijavalinta"))
    System.setProperty("cas-service.sendRenew", "false")
    System.setProperty("cas-service.key", "oma-opiskelijavalinta")

    val domain = sys.env.getOrElse("DOMAIN", "untuvaopintopolku.fi")
    val casUrl = s"https://$domain/cas-oppija"
    System.setProperty("web.url.cas-login", sys.env.getOrElse("CAS_LOGIN_URL", s"$casUrl/login"))
    System.setProperty("web.url.cas", casUrl)

    App.main(args)
}
