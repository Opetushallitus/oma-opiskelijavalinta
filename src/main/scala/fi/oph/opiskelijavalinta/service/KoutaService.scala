package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.{Application, Haku, HakuEnriched, Hakuaika, Hakukohde}
import fi.oph.opiskelijavalinta.util.TimeUtils.{isDateTimeBetween, isNowBetween, KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

import java.time.{Instant, ZonedDateTime}

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
  def getHaku(hakuOid: String, applicationSubmitted: String): Option[HakuEnriched] = {

    koutaClient.getHaku(hakuOid) match {
      case Left(e) =>
        LOG.info(s"Failed to fetch haku data for $hakuOid: ${e.getMessage}")
        Option.empty
      case Right(o) =>
        Option
          .apply(mapper.readValue(o, classOf[Haku]))
          .map(h => enrichHaku(h, applicationSubmitted))
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

  private def findClosestEndDate(hakuajat: Seq[Hakuaika], applicationSubmitted: String): String = {
    val submitted = ZonedDateTime.ofInstant(Instant.parse(applicationSubmitted), ZONE_FINLAND)
    var lahinHakuaika = hakuajat
      .find(ha =>
        ha.alkaa != null && ha.paattyy != null && isDateTimeBetween(
          ha.alkaa,
          ha.paattyy,
          submitted,
          KOUTA_DATETIME_FORMATTER
        )
      )
      .map(h => h.paattyy)
    if (lahinHakuaika.isEmpty) {
      val now = ZonedDateTime.now(ZONE_FINLAND)
      val pastAjat = hakuajat
        .map(ha => ZonedDateTime.parse(ha.paattyy, KOUTA_DATETIME_FORMATTER))
        .filter(end => now.isAfter(end))
        .sorted
        .map(t => Option(KOUTA_DATETIME_FORMATTER.format(t)))
      if (pastAjat.nonEmpty) {
        lahinHakuaika = pastAjat.last
      }
    }
    lahinHakuaika.getOrElse("")
  }

  private def enrichHaku(haku: Haku, applicationSubmitted: String): HakuEnriched = {
    val kaynnissaOlevaHakuAika = haku.hakuajat.find(ha =>
      ha.alkaa != null && ha.paattyy != null && isNowBetween(ha.alkaa, ha.paattyy, KOUTA_DATETIME_FORMATTER)
    )
    val onkoHakuKaynnissa = kaynnissaOlevaHakuAika.nonEmpty
    kaynnissaOlevaHakuAika match
      case Some(hakuaika) => HakuEnriched(haku.oid, haku.nimi, onkoHakuKaynnissa, hakuaika.paattyy)
      case _              =>
        HakuEnriched(haku.oid, haku.nimi, onkoHakuKaynnissa, findClosestEndDate(haku.hakuajat, applicationSubmitted))
  }

}
