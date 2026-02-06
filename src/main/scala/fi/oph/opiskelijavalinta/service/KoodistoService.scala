package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.KoodistoClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.KoodistoKoodi
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class KoodistoService @Autowired (
  koodistoClient: KoodistoClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[KoodistoService])
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)

  @Cacheable(value = Array(CacheConstants.KOODISTO_CACHE_NAME), sync = true)
  def getKooditForKoodisto(koodisto: String): Seq[KoodistoKoodi] = {

    koodistoClient.getKoodit(koodisto) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch koodisto for $koodisto: ${e.getMessage}")
        List.empty
      case Right(o) => mapper.readValue(o, classOf[Array[KoodistoKoodi]]).toSeq
    }
  }
}
