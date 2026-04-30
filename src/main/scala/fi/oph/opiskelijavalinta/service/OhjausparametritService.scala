package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.OhjausparametritClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.OhjausparametritRaw
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class OhjausparametritService @Autowired (
  ohjausparametritClient: OhjausparametritClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OhjausparametritService])
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)

  @Cacheable(value = Array(CacheConstants.OHJAUSPARAMETRIT_CACHE_NAME), sync = true)
  def getOhjausparametritForHaku(hakuOid: String): Option[OhjausparametritRaw] = {

    ohjausparametritClient.getOhjausparametritForHaku(hakuOid) match {
      case Left(e) =>
        LOG.error(s"Ohjausparametrien haku epäonnistui haulle $hakuOid: ${e.getMessage}", e)
        Option.empty
      case Right(o) =>
        try {
          Option.apply(mapper.readValue(o, classOf[OhjausparametritRaw]))
        } catch {
          case e: Exception =>
            LOG.error(s"Ohjausparametrien deserialisointi epäonnistui haulle $hakuOid: ${e.getMessage}", e)
            Option.empty
        }
    }
  }
}
