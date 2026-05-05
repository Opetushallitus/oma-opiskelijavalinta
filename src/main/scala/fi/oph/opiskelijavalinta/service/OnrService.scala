package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import fi.oph.opiskelijavalinta.clients.OnrClient
import fi.oph.opiskelijavalinta.clients.model.Oppija
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class OnrService @Autowired (
  onrClient: OnrClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OnrService])

  private def deserialize(raw: String, context: String): Oppija = {
    try {
      mapper.readValue(raw, classOf[Oppija])
    } catch {
      case e: Exception =>
        LOG.error(s"Henkilötietojen deserialisointi epäonnistui ($context): ${e.getMessage}", e)
        throw RuntimeException(s"Henkilötietojen deserialisointi epäonnistui ($context)", e)
    }
  }

  def getPersonInfo(oid: String): Oppija = {
    onrClient.getPersonInfo(oid) match {
      case Left(e) =>
        LOG.error(s"Henkilötietojen haku epäonnistui oppijanumerolla $oid: ${e.getMessage}", e)
        throw RuntimeException(s"Henkilötietojen haku epäonnistui oppijanumerolla $oid", e)
      case Right(raw) => deserialize(raw, s"oid=$oid")
    }
  }

  def getPersonInfoByHetu(hetu: String): Oppija = {
    onrClient.getPersonInfoByHetu(hetu) match {
      case Left(e) =>
        LOG.error(s"Henkilötietojen haku epäonnistui hetulla: ${e.getMessage}", e)
        throw RuntimeException(s"Henkilötietojen haku epäonnistui hetulla", e)
      case Right(raw) => deserialize(raw, "hetu")
    }
  }
}
