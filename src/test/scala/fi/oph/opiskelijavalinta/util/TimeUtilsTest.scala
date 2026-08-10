package fi.oph.opiskelijavalinta.util

import org.junit.jupiter.api.{Test, TestInstance}
import org.junit.jupiter.api.Assertions.{assertEquals, assertFalse, assertTrue}
import org.junit.jupiter.api.TestInstance.Lifecycle

import java.time.{LocalDate, LocalDateTime}
import java.time.format.DateTimeFormatter

@TestInstance(Lifecycle.PER_CLASS)
class TimeUtilsTest {

  private val KOUTA_DATETIME_WITHOUT_SECONDS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")

  @Test
  def isNowAfterParsesDatetimeWithSeconds(): Unit = {
    val now = LocalDateTime.now(TimeUtils.ZONE_FINLAND)
    assertTrue(TimeUtils.isNowAfter(now.minusSeconds(5).format(TimeUtils.KOUTA_DATETIME_FORMATTER)))
    assertFalse(TimeUtils.isNowAfter(now.plusSeconds(40).format(TimeUtils.KOUTA_DATETIME_FORMATTER)))
  }

  @Test
  def isNowAfterParsesDatetimeWithoutSeconds(): Unit = {
    val now = LocalDateTime.now(TimeUtils.ZONE_FINLAND)
    assertTrue(TimeUtils.isNowAfter(now.minusMinutes(1).format(KOUTA_DATETIME_WITHOUT_SECONDS_FORMATTER)))
    assertFalse(TimeUtils.isNowAfter(now.plusMinutes(2).format(KOUTA_DATETIME_WITHOUT_SECONDS_FORMATTER)))
  }

  @Test
  def isNowAfterParsesDateOnly(): Unit = {
    val now = LocalDate.now(TimeUtils.ZONE_FINLAND)
    assertTrue(TimeUtils.isNowAfter(now.minusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)))
    assertFalse(TimeUtils.isNowAfter(now.plusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)))
  }

  @Test
  def parseKoutaDateParsesDatetimeWithSeconds(): Unit = {
    assertEquals(LocalDate.of(2024, 3, 18), TimeUtils.parseKoutaDate("2024-03-18T00:00:05"))
  }

  @Test
  def parseKoutaDateParsesDatetimeWithoutSeconds(): Unit = {
    assertEquals(LocalDate.of(2024, 3, 18), TimeUtils.parseKoutaDate("2024-03-18T00:00"))
  }

  @Test
  def parseKoutaDateParsesDateOnly(): Unit = {
    assertEquals(LocalDate.of(2024, 3, 18), TimeUtils.parseKoutaDate("2024-03-18"))
  }
}
