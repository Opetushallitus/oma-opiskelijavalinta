package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, TranslatedName}
import org.junit.jupiter.api.BeforeEach
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle

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
              ),
              None
            )
          )
        )
      )
  }

  @Test
  def returnsHakuForHakemus(): Unit = {
    val haku = koutaService.getHaku(HAKU_OID)
    Assertions.assertFalse(haku.isEmpty)
    Assertions.assertEquals(HAKU_OID, haku.get.oid)
    Assertions.assertEquals("Purkanpurijoiden haku", haku.get.nimi.fi)
    Assertions.assertEquals("Samma på svenska", haku.get.nimi.sv)
    Assertions.assertEquals("Gumchewer search", haku.get.nimi.en)
  }
}
