package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.{JsonSetter, Nulls}
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.ValintaTulosServiceClient
import fi.oph.opiskelijavalinta.model.HakemuksenTulos
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class VTSService @Autowired (vtsClient: ValintaTulosServiceClient, mapper: ObjectMapper = new ObjectMapper()) {

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper
    .configOverride(classOf[List[_]])
    .setSetterInfo(JsonSetter.Value.forValueNulls(Nulls.AS_EMPTY))

  private val LOG: Logger = LoggerFactory.getLogger(classOf[KoutaService]);

  def getValinnanTulokset(hakuOid: String, hakemusOid: String): Option[HakemuksenTulos] = {

    vtsClient.getValinnanTulokset(hakuOid, hakemusOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch valinnantulos data for $hakuOid, $hakemusOid: ${e.getMessage}")
        Option.empty
      case Right(o) => Option.apply(mapper.readValue(o, classOf[HakemuksenTulos]))
    }
  }

  def doVastaanotto(hakemusOid: String, hakukohdeOid: String, vastaanotto: String): Option[String] = {
    vtsClient.postVastaanotto(hakemusOid, hakukohdeOid, vastaanotto) match {
      case Left(e) =>
        LOG.info(s"Failed to do vastaanotto for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
        throw RuntimeException(s"Failed to do vastaanotto for $hakemusOid, $hakukohdeOid: ${e.getMessage}")
      case Right(o) => Option.apply(o)
    }
  }

}
