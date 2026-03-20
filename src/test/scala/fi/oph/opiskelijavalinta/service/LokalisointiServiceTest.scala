package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.{KoutaClient, LokalisointiClient}
import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, TranslatedName}
import fi.oph.opiskelijavalinta.util.SupportedLanguage.{en, fi, sv}
import org.junit.jupiter.api.{Assertions, BeforeEach, Test, TestInstance}
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

import java.time.LocalDateTime

@TestInstance(Lifecycle.PER_CLASS)
class LokalisointiServiceTest {

  private val client: LokalisointiClient = Mockito.mock(classOf[LokalisointiClient])

  private val service: LokalisointiService = LokalisointiService(client)

  private val fileName: String = "/test-translation.json";

  @BeforeEach def setup(): Unit = {
    val text = scala.io.Source.fromInputStream(getClass.getResourceAsStream(fileName)).mkString
    Mockito
      .when(client.getLokalisaatiot(fi))
      .thenReturn(
        Right(text)
      )
  }

  @Test
  def returnsCorrectTranslation(): Unit = {
    assertEquals("Opintopolku: Vastauksesi on vastaanotettu", service.getTranslation(fi, "vastaanottoviesti.otsikko"))
    assertEquals(
      "Älä vastaa tähän viestiin - viesti on lähetetty automaattisesti.",
      service.getTranslation(fi, "vastaanottoviesti.viesti.ala-vastaa")
    )
  }

  @Test
  def returnsKeyForMissingTranslationFile(): Unit = {
    assertEquals("vastaanottoviesti.otsikko", service.getTranslation(en, "vastaanottoviesti.otsikko"))
  }

  @Test
  def returnsKeyForMissingTranslation(): Unit = {
    assertEquals("vastaanottoviesti.otsikko2", service.getTranslation(fi, "vastaanottoviesti.otsikko2"))
  }

  @Test
  def translatesWithParam(): Unit = {
    assertEquals(
      "Olemme vastaanottaneet 9.3.2026 klo 09:50 vastauksesi:",
      service.getTranslationWithParams(
        fi,
        "vastaanottoviesti.viesti.olemme-vastaanottaneet",
        Map("aikaleima" -> LocalDateTime.of(2026, 3, 9, 9, 50))
      )
    )
  }

  @Test
  def translatesDateParamToFinnish(): Unit = {
    assertEquals(
      "20.11.2026 klo 18:30",
      service.translateObject(
        LocalDateTime.of(2026, 11, 20, 18, 30),
        fi
      )
    )
  }

  @Test
  def translatesDateParamToEnglish(): Unit = {
    assertEquals(
      "Nov. 20, 2026 at 18:30 PM EET".toLowerCase,
      service
        .translateObject(
          LocalDateTime.of(2026, 11, 20, 18, 30),
          en
        )
        .toLowerCase
    )
  }

  @Test
  def translatesDateParamToSwedish(): Unit = {
    assertEquals(
      "20.11.2026 kl. 18:30",
      service.translateObject(
        LocalDateTime.of(2026, 11, 20, 18, 30),
        sv
      )
    )
  }

  @Test
  def returnsKeyForMissingTranslationFileWhenTranslatingWithParam(): Unit = {
    assertEquals(
      "vastaanottoviesti.viesti.olemme-vastaanottaneet",
      service.getTranslationWithParams(
        en,
        "vastaanottoviesti.viesti.olemme-vastaanottaneet",
        Map("aikaleima" -> "26.11.2025 klo 15:12")
      )
    )
  }

  @Test
  def returnsKeyForMissingTranslationWhenTranslatingWithParam(): Unit = {
    assertEquals(
      "vastaanottoviesti.viesti.olemme-vastaanottaneet2",
      service.getTranslationWithParams(
        fi,
        "vastaanottoviesti.viesti.olemme-vastaanottaneet2",
        Map("aikaleima" -> "26.11.2025 klo 15:12")
      )
    )
  }
}
