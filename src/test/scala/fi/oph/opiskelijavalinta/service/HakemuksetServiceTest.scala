package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.{AtaruClient, KoutaClient}
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import fi.oph.opiskelijavalinta.util.TimeUtils.{KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}
import org.junit.jupiter.api.BeforeEach
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle

import java.time.ZonedDateTime

@TestInstance(Lifecycle.PER_CLASS)
class HakemuksetServiceTest {

  val koutaService: KoutaService                       = Mockito.mock(classOf[KoutaService])
  val ataruClient: AtaruClient                         = Mockito.mock(classOf[AtaruClient])
  val ohjausparametritService: OhjausparametritService = Mockito.mock(classOf[OhjausparametritService])
  val vtsService: VTSService                           = Mockito.mock(classOf[VTSService])

  val service: HakemuksetService = HakemuksetService(ataruClient, koutaService, ohjausparametritService, vtsService)

  val OPPIJA_NUMERO = "numero-1"

  @Test
  def applicationWithoutHakuDoesNotCallOtherServices(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(OPPIJA_NUMERO))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                "application-oid-1",
                null,
                List.empty,
                "secret-1",
                "2025-02-02T19:32:01Z",
                false,
                TranslatedName("Hajuton lomake", null, null),
                Option.empty,
                Option.empty
              )
            )
          )
        )
      )
    val hakemukset = service.getHakemukset(OPPIJA_NUMERO)
    Assertions.assertEquals(0, hakemukset.current.length)
    Assertions.assertEquals(1, hakemukset.old.length)
    val app = hakemukset.old.head
    Assertions.assertEquals("application-oid-1", app.oid)
    Assertions.assertEquals("Hajuton lomake", app.formName.fi)
    Assertions.assertTrue(app.haku.isEmpty)
    Assertions.assertTrue(app.hakukohteet.isEmpty)
    Assertions.assertTrue(app.ohjausparametrit.isEmpty)
    Mockito.verifyNoInteractions(koutaService, ohjausparametritService, vtsService)
  }
}
