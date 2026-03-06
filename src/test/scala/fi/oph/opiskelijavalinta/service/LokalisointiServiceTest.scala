package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.{KoutaClient, LokalisointiClient}
import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, TranslatedName}
import fi.oph.opiskelijavalinta.util.SupportedLanguage.fi
import org.junit.jupiter.api.{Assertions, BeforeEach, Test, TestInstance}
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

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
  def translatesWithParam(): Unit = {
    assertEquals(
      "Olemme vastaanottaneet 26.11.2025 klo 15:12 vastauksesi:",
      service.getTranslationWithParams(
        fi,
        "vastaanottoviesti.viesti.olemme-vastaanottaneet",
        Map("aikaleima" -> "26.11.2025 klo 15:12")
      )
    )
  }
}
