package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.model.{Application, Haku}
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

  @Cacheable(value = Array("kouta-haku"), sync = true)
  def getHaku(hakuOid: String): Haku = {

    koutaClient.getHaku(hakuOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch haku data for $hakuOid: ${e.getMessage}")
        null
      case Right(o) => mapper.readValue(o, classOf[Haku])
    }
  }

}
