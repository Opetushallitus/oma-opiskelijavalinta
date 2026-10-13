package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.{OhjausparametritClient, OppijanTunnistusClient}
import fi.oph.opiskelijavalinta.model.{OppijanTunnistusVerification, OppijantunnistusMetadata}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class LinkVerificationService @Autowired (
  oppijanTunnistusClient: OppijanTunnistusClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[LinkVerificationService])

  /**
   * Heittää RuntimeExceptionin jos oppijan-tunnistuksen kutsu tai vastauksen käsittely epäonnistuu, jotta
   * palveluvirhe ei näyttäydy kutsujalle virheellisenä tokenina. Tuntematon ja vanhentunut token eivät ole virheitä,
   * vaan ne näkyvät palautuvan vastauksen exists- ja valid-kentissä.
   */
  def verify(token: String): OppijanTunnistusVerification = {

    val raw = oppijanTunnistusClient.verifyToken(token) match {
      case Left(e) =>
        LOG.error(s"Verifiointi epäonnistui tokenille $token: ${e.getMessage}", e)
        throw RuntimeException("Kirjautumistokenin verifiointi epäonnistui", e)
      case Right(o) => o
    }

    try {
      mapper.readValue(raw, classOf[OppijanTunnistusVerification])
    } catch {
      case e: Exception =>
        LOG.error(s"Tokenin deserialisointi epäonnistui tokenille $token: ${e.getMessage}", e)
        throw RuntimeException("Kirjautumistokenin deserialisointi epäonnistui", e)
    }
  }
}
