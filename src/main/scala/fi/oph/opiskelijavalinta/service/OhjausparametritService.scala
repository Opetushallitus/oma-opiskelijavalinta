package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.OhjausparametritClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.Ohjausparametrit
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class OhjausparametritService @Autowired (ohjausparametritClient: OhjausparametritClient, mapper: ObjectMapper = new ObjectMapper()) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[OhjausparametritService])
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)

  @Cacheable(value = Array(CacheConstants.OHJAUSPARAMETRIT_CACHE_NAME), sync = true)
  def getOhjausparametritForHaku(hakuOid: String): Option[Ohjausparametrit] = {

    ohjausparametritClient.getOhjausparametritForHaku(hakuOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch ohjausparametrit for $hakuOid: ${e.getMessage}")
        Option.empty
      case Right(o) => Option.apply(mapper.readValue(o, classOf[Ohjausparametrit]))
    }
  }
}
