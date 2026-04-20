package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.google.gson.{JsonObject, JsonParser}
import fi.oph.opiskelijavalinta.clients.LokalisointiClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.TranslatedName
import fi.oph.opiskelijavalinta.util.TranslationUtil.translateName
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import fi.oph.opiskelijavalinta.util.SupportedLanguage.{en, fi, sv}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

import java.time.format.DateTimeFormatter
import java.time.{LocalDate, LocalDateTime, ZoneId, ZonedDateTime}
import java.util.Locale

@Service
class LokalisointiService @Autowired (
  lokalisointiClient: LokalisointiClient,
  mapper: ObjectMapper = new ObjectMapper()
) {

  val zone: ZoneId                                = ZoneId.of("Europe/Helsinki")
  val DEFAULT_DATE_TIME_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("d.M.yyyy 'klo' HH:mm").withZone(zone)
  val SWEDISH_DATE_TIME_FORMAT: DateTimeFormatter = DateTimeFormatter.ofPattern("d.M.yyyy 'kl.' HH:mm").withZone(zone)
  val ENGLISH_DATE_TIME_FORMAT: DateTimeFormatter =
    DateTimeFormatter.ofPattern("MMM. d, yyyy 'at' HH:mm a z").withLocale(Locale.US).withZone(zone)
  val LANGUAGE_FORMATTER_MAP: Map[SupportedLanguage, DateTimeFormatter] =
    Map(fi -> DEFAULT_DATE_TIME_FORMAT, sv -> SWEDISH_DATE_TIME_FORMAT, en -> ENGLISH_DATE_TIME_FORMAT)

  private val LOG: Logger = LoggerFactory.getLogger(classOf[LokalisointiService])
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.registerModule(new Jdk8Module())

  @Cacheable(value = Array(CacheConstants.LOKALISOINTI_CACHE_NAME), sync = true)
  def getTranslations(lang: SupportedLanguage): Option[JsonObject] = {

    lokalisointiClient.getLokalisaatiot(lang) match {
      case Left(e) =>
        LOG.warn(s"Käännösten lataaminen epäonnistui $lang: ${e.getMessage}", e)
        None
      case Right(o) => Some(JsonParser.parseString(o).getAsJsonObject)
    }
  }

  def getTranslation(lang: SupportedLanguage, key: String): String = {
    try {
      getTranslations(lang).fold {
        LOG.warn(s"Käännöstiedostoa ei saanut ladattua kielelle $lang. Palautetaan käännösavain.")
        key
      }(json => json.get(key).getAsString)
    } catch {
      case e: Throwable =>
        LOG.warn(s"Käännösavaimelle $key ei löytynyt käännöstä kielelle $lang. Palautetaan käännösavain")
        key
    }
  }

  def getTranslationWithParams(lang: SupportedLanguage, key: String, params: Map[String, Object]): String = {
    var translation = getTranslation(lang, key)
    params.foreach((key, value) => translation = translation.replaceAll(s"\\{$key}", translateObject(value, lang)))
    translation
  }

  def translateObject(obj: Object, lang: SupportedLanguage): String = {
    obj match
      case ld: LocalDate                  => ld.format(LANGUAGE_FORMATTER_MAP(lang))
      case ldt: LocalDateTime             => ldt.format(LANGUAGE_FORMATTER_MAP(lang))
      case translatedName: TranslatedName => translateName(translatedName, lang)
      case o                              => o.toString
  }
}
