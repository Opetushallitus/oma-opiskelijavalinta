package fi.oph.opiskelijavalinta.util

import java.time.{ZoneId, ZonedDateTime}
import java.time.format.DateTimeFormatter
import java.util.Locale

object TimeUtils {

  val ZONE_FINLAND: ZoneId                        = ZoneId.of("Europe/Helsinki")
  val KOUTA_DATETIME_FORMATTER: DateTimeFormatter = DateTimeFormatter
    .ofPattern("yyyy-MM-dd'T'HH:mm:ss")
    .withZone(ZONE_FINLAND)

  def isNowBetween(start: String, end: String, formatter: DateTimeFormatter): Boolean = {
    val now = ZonedDateTime.now(ZONE_FINLAND)
    isDateTimeBetween(start, end, now, formatter)
  }

  def isDateTimeBetween(start: String, end: String, dateTime: ZonedDateTime, formatter: DateTimeFormatter): Boolean = {
    val startD = ZonedDateTime.parse(start, formatter)
    val endD   = ZonedDateTime.parse(end, formatter)
    (dateTime.isAfter(startD) || dateTime.isEqual(startD))
    && dateTime.isBefore(endD)
  }

  private val finnishFormatter =
    DateTimeFormatter
      .ofPattern("d.M.yyyy 'klo' HH:mm")
      .withLocale(Locale.forLanguageTag("fi"))

  private val swedishFormatter =
    DateTimeFormatter
      .ofPattern("d.M.yyyy 'kl.' HH:mm")
      .withLocale(Locale.forLanguageTag("sv"))

  private val englishFormatter =
    DateTimeFormatter
      .ofPattern("MMM. d, yyyy 'at' hh:mm a z")
      .withLocale(Locale.US)

  def formatterFor(lang: SupportedLanguage): DateTimeFormatter =
    lang match
      case SupportedLanguage.fi => finnishFormatter
      case SupportedLanguage.sv => swedishFormatter
      case SupportedLanguage.en => englishFormatter
}
