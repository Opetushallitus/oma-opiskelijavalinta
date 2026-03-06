package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.google.gson.{JsonObject, JsonParser}
import fi.oph.opiskelijavalinta.clients.LokalisointiClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.KoodistoKoodi
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class LokalisointiService @Autowired (
  lokalisointiClient: LokalisointiClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[LokalisointiService])
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.registerModule(new Jdk8Module())

  @Cacheable(value = Array(CacheConstants.LOKALISOINTI_CACHE_NAME), sync = true)
  def getTranslations(lang: SupportedLanguage): Option[JsonObject] = {

    lokalisointiClient.getLokalisaatiot(lang) match {
      case Left(e) =>
        LOG.warn(s"Käännösten lataaminen epäonnistui $lang: ${e.getMessage}")
        None
      case Right(o) => Some(JsonParser.parseString(o).getAsJsonObject)
    }
  }

  def getTranslation(lang: SupportedLanguage, key: String): String = {
    getTranslations(lang).fold {
      LOG.warn(s"Käännöstiedostoa ei saanut ladattua kielelle $lang. Palautetaan käännösavain.")
      key
    }(json => getTranslationFromJson(json, key.split("\\.")))
  }

  def getTranslationWithParams(lang: SupportedLanguage, key: String, params: Map[String, Object]): String = {
    var translation = getTranslation(lang, key)
    params.foreach((key, value) => translation = translation.replaceAll(s"\\{$key}", value.toString))
    translation
  }

  private def getTranslationFromJson(data: JsonObject, path: Array[String]): String = {
    path.zipWithIndex
      .foldLeft(data) { case (json, (pathElem, idx)) =>
        if (idx + 1 >= path.length) json
        else json.getAsJsonObject(pathElem)
      }
      .get(path.last)
      .getAsString
  }
}
