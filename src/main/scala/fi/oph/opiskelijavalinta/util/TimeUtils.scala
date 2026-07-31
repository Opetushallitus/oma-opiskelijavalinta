package fi.oph.opiskelijavalinta.util

import java.time.{LocalDate, LocalDateTime, ZoneId, ZonedDateTime}
import java.util.Locale
import java.time.format.DateTimeFormatter
import fi.oph.opiskelijavalinta.util.SupportedLanguage.{en, fi, sv}

object TimeUtils {

  val ZONE_FINLAND: ZoneId                        = ZoneId.of("Europe/Helsinki")
  val KOUTA_DATETIME_FORMATTER: DateTimeFormatter = DateTimeFormatter
    .ofPattern("yyyy-MM-dd'T'HH:mm:ss")
    .withZone(ZONE_FINLAND)

  private val KOUTA_DATE_PATTERN = "yyyy-MM-dd"

  val KOUTA_DATE_FORMATTER: DateTimeFormatter = DateTimeFormatter.ofPattern(KOUTA_DATE_PATTERN)

  val DEFAULT_DATE_FORMAT: DateTimeFormatter      = DateTimeFormatter.ofPattern("d.M.yyyy")
  val DEFAULT_DATE_TIME_FORMAT: DateTimeFormatter =
    DateTimeFormatter.ofPattern("d.M.yyyy 'klo' HH:mm").withZone(ZONE_FINLAND)
  val SWEDISH_DATE_TIME_FORMAT: DateTimeFormatter =
    DateTimeFormatter.ofPattern("d.M.yyyy 'kl.' HH:mm").withZone(ZONE_FINLAND)
  val ENGLISH_DATE_TIME_FORMAT: DateTimeFormatter =
    DateTimeFormatter.ofPattern("MMM. d, yyyy 'at' HH:mm a z").withLocale(Locale.US).withZone(ZONE_FINLAND)
  val LANGUAGE_FORMATTER_MAP: Map[SupportedLanguage, DateTimeFormatter] =
    Map(fi -> DEFAULT_DATE_TIME_FORMAT, sv -> SWEDISH_DATE_TIME_FORMAT, en -> ENGLISH_DATE_TIME_FORMAT)

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

  def isNowAfter(timeStr: String): Boolean = {
    if (timeStr.length.equals(KOUTA_DATE_PATTERN.length)) {
      val now  = LocalDate.now(ZONE_FINLAND)
      val time = LocalDate.parse(timeStr, KOUTA_DATE_FORMATTER)
      now.isAfter(time)
    } else {
      val now  = LocalDateTime.now(ZONE_FINLAND)
      val time = LocalDateTime.parse(timeStr, KOUTA_DATETIME_FORMATTER)
      now.isAfter(time)
    }

  }
}
