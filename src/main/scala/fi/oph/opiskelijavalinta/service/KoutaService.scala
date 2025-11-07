package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.{Application, Haku, Hakukohde}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class KoutaService @Autowired (koutaClient: KoutaClient, mapper: ObjectMapper = new ObjectMapper()) {

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[KoutaService]);

  @Cacheable(value = Array(CacheConstants.KOUTA_HAKU_CACHE_NAME), sync = true)
  def getHaku(hakuOid: String): Option[Haku] = {

    koutaClient.getHaku(hakuOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch haku data for $hakuOid: ${e.getMessage}")
        Option.empty
      case Right(o) => Option.apply(mapper.readValue(o, classOf[Haku]))
    }
  }
  
  @Cacheable(value = Array(CacheConstants.KOUTA_HAKUKOHDE_CACHE_NAME), sync = true)
  def getHakukohde(hakukohdeOid: String): Option[Hakukohde] = {
    koutaClient.getHakukohde(hakukohdeOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch haku data for $hakukohdeOid: ${e.getMessage}")
        Option.empty
      case Right(o) => Option.apply(mapper.readValue(o, classOf[Hakukohde]))
    }
  }

}
