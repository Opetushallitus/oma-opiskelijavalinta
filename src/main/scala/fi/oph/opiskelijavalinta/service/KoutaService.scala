package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.Constants.{KOULUTUKSEN_ALKAMISKAUSI_KEVAT, KOULUTUKSEN_ALKAMISKAUSI_SYKSY}
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.configuration.CacheConstants
import fi.oph.opiskelijavalinta.model.{Haku, Hakukohde, HakukohdeEnriched, PaateltyAlkamisajankohta}
import fi.oph.opiskelijavalinta.util.TimeUtils
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

import java.time.{LocalDateTime, ZonedDateTime}

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
  def getHaku(hakuOid: String): Haku = {
    koutaClient.getHaku(hakuOid) match {
      case Left(e) =>
        LOG.warn(s"Virhe haun tietojen hakemisessa haku-oidilla $hakuOid: ${e.getMessage}", e)
        throw RuntimeException(s"Virhe haun tietojen hakemisessa haku-oidilla $hakuOid", e)
      case Right(o) =>
        try {
          mapper.readValue(o, classOf[Haku])
        } catch {
          case e: Exception =>
            LOG.error(s"Virhe haun deserialisoinnissa haku-oidilla $hakuOid: ${e.getMessage}", e)
            throw RuntimeException(s"Virhe haun deserialisoinnissa haku-oidilla $hakuOid", e)
        }
    }
  }

  @Cacheable(value = Array(CacheConstants.KOUTA_HAKUKOHDE_CACHE_NAME), sync = true)
  def getHakukohde(hakukohdeOid: String): Hakukohde = {
    koutaClient.getHakukohde(hakukohdeOid) match {
      case Left(e) =>
        LOG.warn(s"Virhe hakukohteen tietojen hakemusessa oidilla $hakukohdeOid: ${e.getMessage}")
        throw RuntimeException(s"Virhe hakukohteen tietojen hakemisessa oidilla $hakukohdeOid", e)
      case Right(o) =>
        try {
          mapper.readValue(o, classOf[Hakukohde])
        } catch {
          case e: Exception =>
            LOG.error(s"Virhe hakukohteen deserialisoinnissa oidilla $hakukohdeOid: ${e.getMessage}", e)
            throw RuntimeException(s"Virhe hakukohteen deserialisoinnissa oidilla $hakukohdeOid", e)
        }
    }
  }

  def getEnrichedHakukohde(hakukohdeOid: String): Option[HakukohdeEnriched] = {
    Some(getHakukohde(hakukohdeOid)).map(enrichHakukohde)
  }

  private def enrichHakukohde(hk: Hakukohde): HakukohdeEnriched = {
    val alkupvm = hk.paateltyAlkamisajankohta.flatMap(koulutuksenAlkuPvm(_, hk.oid))
    HakukohdeEnriched(
      oid = hk.oid,
      nimi = hk.nimi,
      jarjestyspaikkaHierarkiaNimi = hk.jarjestyspaikkaHierarkiaNimi,
      uudenOpiskelijanUrl = hk.uudenOpiskelijanUrl,
      yhdenPaikanSaanto = hk.yhdenPaikanSaanto,
      koulutuksenAlkamiskausi = hk.paateltyAlkamiskausi
        .flatMap(pa =>
          pa.kausiUri
            .map(s =>
              if (s.startsWith(KOULUTUKSEN_ALKAMISKAUSI_KEVAT)) KOULUTUKSEN_ALKAMISKAUSI_KEVAT
              else KOULUTUKSEN_ALKAMISKAUSI_SYKSY
            )
        ),
      koulutuksenAlkamisPvm = alkupvm
    )
  }

  private def koulutuksenAlkuPvm(ajankohta: PaateltyAlkamisajankohta, hakukohdeOid: String): Option[String] = {
    (ajankohta.pvm, ajankohta.pvm.isBlank, ajankohta.henkilokohtainenSuunnitelma) match {
      case (_, true, false) =>
        LOG.warn(
          s"Hakukohteelle $hakukohdeOid ei ole aseteltu päättymispäivämäärää ja se ei ole myöskään henkilökohtaisen suunnitelman mukainen"
        )
        None
      case (pvm, false, false) =>
        if (TimeUtils.isNowAfter(pvm)) {
          Some(TimeUtils.KOUTA_DATE_FORMATTER.format(ZonedDateTime.now(TimeUtils.ZONE_FINLAND).minusDays(1)))
        } else {
          Some(pvm)
        }
      case (_, _, true) =>
        Some(TimeUtils.KOUTA_DATE_FORMATTER.format(ZonedDateTime.now(TimeUtils.ZONE_FINLAND).minusDays(1)))
    }
  }

}
