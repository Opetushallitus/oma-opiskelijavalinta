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

  def verify(token: String): Option[OppijanTunnistusVerification] = {

    oppijanTunnistusClient.verifyToken(token) match {
      case Left(e) =>
        LOG.error(s"Verification failed for token $token: ${e.getMessage}")
        Option.empty
      case Right(o) =>
        Option
          .apply(mapper.readValue(o, classOf[OppijanTunnistusVerification]))
    }
  }
}
