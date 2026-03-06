package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.{JsonSetter, Nulls}
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.model.{HakemuksenTulos, HakemuksenTulosRaw, HakutoiveenTulos, HakutoiveenTulosEnriched}
import fi.oph.opiskelijavalinta.util.{SupportedLanguage, TranslationUtil}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ViestiService @Autowired (hakemuksetService: HakemuksetService, koutaService: KoutaService) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[ViestiService]);

  def lahetaVastaanottoViesti(
    oppijanumero: String,
    hakukohdeOid: String,
    hakemusOid: String,
    lang: SupportedLanguage
  ): Unit = {
    val hakutoive = koutaService.getHakukohde(hakukohdeOid)
    val email     = hakemuksetService.getHakemusEmail(oppijanumero, hakemusOid)
  }

}
