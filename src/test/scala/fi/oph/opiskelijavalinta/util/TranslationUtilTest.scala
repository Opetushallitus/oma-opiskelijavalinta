package fi.oph.opiskelijavalinta.util

import fi.oph.opiskelijavalinta.model.TranslatedName
import fi.oph.opiskelijavalinta.util.TranslationUtil.translateName
import fi.oph.opiskelijavalinta.util.SupportedLanguage.{en, fi, sv}
import org.junit.jupiter.api.{Test, TestInstance}
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.TestInstance.Lifecycle

@TestInstance(Lifecycle.PER_CLASS)
class TranslationUtilTest {
  W
  @Test
  def translatesNameToFinnish(): Unit = {
    assertEquals("Pähkinä", translateName(TranslatedName("Pähkinä", "Nöt", "Nut"), fi))
  }

  @Test
  def translatesNameToSwedish(): Unit = {
    assertEquals("Nöt", translateName(TranslatedName("Pähkinä", "Nöt", "Nut"), sv))
  }

  @Test
  def translatesNameToEnglish(): Unit = {
    assertEquals("Nut", translateName(TranslatedName("Pähkinä", "Nöt", "Nut"), en))
  }

  @Test
  def fallsbackToOtherLanguagesWhenFinnishNameNotFound(): Unit = {
    assertEquals("Nut", translateName(TranslatedName("", "Nöt", "Nut"), fi))
    assertEquals("Nöt", translateName(TranslatedName("", "Nöt", ""), fi))
  }

  @Test
  def fallsbackToOtherLanguagesWhenSwedishNameNotFound(): Unit = {
    assertEquals("Pähkinä", translateName(TranslatedName("Pähkinä", "", "Nut"), sv))
    assertEquals("Nut", translateName(TranslatedName("", "", "Nut"), sv))
  }

  @Test
  def fallsbackToOtherLanguagesWhenEnglishNameNotFound(): Unit = {
    assertEquals("Pähkinä", translateName(TranslatedName("Pähkinä", "Nöt", ""), en))
    assertEquals("Nöt", translateName(TranslatedName("", "Nöt", ""), en))
  }

  @Test
  def returnsEmptyStringWhenTranslationIsMissingForALlLanguages(): Unit = {
    assertEquals("", translateName(TranslatedName("", "", ""), fi))
    assertEquals("", translateName(TranslatedName("", "", ""), en))
    assertEquals("", translateName(TranslatedName("", "", ""), sv))
  }
}
