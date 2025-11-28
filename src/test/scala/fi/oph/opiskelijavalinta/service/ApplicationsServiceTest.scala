package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.databind.ObjectMapper
import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.{AtaruClient, KoutaClient}
import fi.oph.opiskelijavalinta.model.{Application, TranslatedName}
import fi.oph.opiskelijavalinta.util.TimeUtils.{KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}
import org.junit.jupiter.api.BeforeEach
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle

import java.time.ZonedDateTime

@TestInstance(Lifecycle.PER_CLASS)
class ApplicationsServiceTest {

  val koutaService: KoutaService                       = Mockito.mock(classOf[KoutaService])
  val ataruClient: AtaruClient                         = Mockito.mock(classOf[AtaruClient])
  val ohjausparametritService: OhjausparametritService = Mockito.mock(classOf[OhjausparametritService])
  val vtsService: VTSService                           = Mockito.mock(classOf[VTSService])

  val service: ApplicationsService = ApplicationsService(ataruClient, koutaService, ohjausparametritService, vtsService)

  val OPPIJA_NUMERO = "numero-1"

  @Test
  def applicationWithoutHakuDoesNotCallOtherServices(): Unit = {
    Mockito
      .when(ataruClient.getApplications(OPPIJA_NUMERO))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Application(
                "application-oid-1",
                null,
                Set.empty,
                "secret-1",
                "2025-02-02T19:32:01Z",
                TranslatedName("Hajuton lomake", null, null)
              )
            )
          )
        )
      )
    val applications = service.getApplications(OPPIJA_NUMERO)
    Assertions.assertEquals(0, applications.current.length)
    Assertions.assertEquals(1, applications.old.length)
    val app = applications.old.head
    Assertions.assertEquals("application-oid-1", app.oid)
    Assertions.assertEquals("Hajuton lomake", app.formName.fi)
    Assertions.assertTrue(app.haku.isEmpty)
    Assertions.assertTrue(app.hakukohteet.isEmpty)
    Assertions.assertTrue(app.ohjausparametrit.isEmpty)
    Mockito.verifyNoInteractions(koutaService, ohjausparametritService, vtsService)
  }
}
