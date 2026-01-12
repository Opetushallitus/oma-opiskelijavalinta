package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, TranslatedName}
import fi.oph.opiskelijavalinta.util.TimeUtils.{KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}
import org.junit.jupiter.api.BeforeEach
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle

import java.time.ZonedDateTime

@TestInstance(Lifecycle.PER_CLASS)
class KoutaServiceTest {

  val koutaClient: KoutaClient = Mockito.mock(classOf[KoutaClient])

  val koutaService: KoutaService = KoutaService(koutaClient)

  val HAKU_OID = "HAKU-OID-1"

  @BeforeEach def setup(): Unit = {
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Haku(
              HAKU_OID,
              TranslatedName("Purkanpurijoiden haku", "Samma på svenska", "Gumchewer search"),
              "hakutapa_01",
              "haunkohdejoukko_20",
              Seq(
                Hakuaika("2024-11-19T09:32:01", "2024-11-29T09:32:01"),
                Hakuaika("2023-11-19T09:32:01", "2023-11-29T09:32:01"),
                Hakuaika("2022-11-19T09:32:01", "2022-11-29T09:32:01")
              )
            )
          )
        )
      )
  }

  @Test
  def returnsHakuForApplication(): Unit = {
    val haku = koutaService.getHaku(HAKU_OID, "2024-11-19T10:32:01Z")
    Assertions.assertFalse(haku.isEmpty)
    Assertions.assertEquals(HAKU_OID, haku.get.oid)
    Assertions.assertEquals("Purkanpurijoiden haku", haku.get.nimi.fi)
    Assertions.assertFalse(haku.get.hakuaikaKaynnissa)
    Assertions.assertEquals("2024-11-29T09:32:01", haku.get.viimeisinPaattynytHakuAika)
  }

  @Test
  def returnsAlwaysFittingLatestHakuAikaForPastApplication(): Unit = {
    Assertions.assertEquals(
      "2023-11-29T09:32:01",
      koutaService.getHaku(HAKU_OID, "2023-11-19T10:32:01Z").get.viimeisinPaattynytHakuAika
    )
    Assertions.assertEquals(
      "2022-11-29T09:32:01",
      koutaService.getHaku(HAKU_OID, "2022-11-19T10:32:01Z").get.viimeisinPaattynytHakuAika
    )
    Assertions.assertEquals(
      "2024-11-29T09:32:01",
      koutaService.getHaku(HAKU_OID, "2025-10-19T10:32:01Z").get.viimeisinPaattynytHakuAika
    )
  }

  @Test
  def returnsHakuWithHakuaikaKaynnissaForApplication(): Unit = {
    val future = KOUTA_DATETIME_FORMATTER.format(ZonedDateTime.now(ZONE_FINLAND).plusDays(1))
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Haku(
              HAKU_OID,
              TranslatedName("Ajankohtaista haku", "Samma på svenska", "Now search"),
              "hakutapa_01",
              "haunkohdejoukko_20",
              Seq(Hakuaika("2025-10-19T09:32:01", future))
            )
          )
        )
      )
    val haku = koutaService.getHaku(HAKU_OID, "2025-12-19T10:32:01Z")
    Assertions.assertFalse(haku.isEmpty)
    Assertions.assertEquals(HAKU_OID, haku.get.oid)
    Assertions.assertEquals("Ajankohtaista haku", haku.get.nimi.fi)
    Assertions.assertTrue(haku.get.hakuaikaKaynnissa)
    Assertions.assertEquals(future, haku.get.viimeisinPaattynytHakuAika)
    Assertions.assertEquals("haunkohdejoukko_20", haku.get.kohdejoukkoKoodiUri)
    Assertions.assertEquals("hakutapa_01", haku.get.hakutapaKoodiUri)
  }
}
