package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.oph.opiskelijavalinta.model.{Hakemus, Maksutila, TranslatedName}
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle

@TestInstance(Lifecycle.PER_CLASS)
class HakemuksetServiceTest {

  val koutaService: KoutaService                       = Mockito.mock(classOf[KoutaService])
  val ataruClient: AtaruClient                         = Mockito.mock(classOf[AtaruClient])
  val ohjausparametritService: OhjausparametritService = Mockito.mock(classOf[OhjausparametritService])
  val vtsService: VTSService                           = Mockito.mock(classOf[VTSService])
  val tuloskirjeService: TuloskirjeService             = Mockito.mock(classOf[TuloskirjeService])

  val service: HakemuksetService =
    HakemuksetService(ataruClient, koutaService, ohjausparametritService, vtsService, tuloskirjeService)

  val OPPIJA_NUMERO = "numero-1"

  @Test
  def applicationWithoutHakuDoesNotCallOtherServices(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(OPPIJA_NUMERO))
      .thenReturn(hautonHakemus(true))
    val hakemukset = service.getHakemukset(OPPIJA_NUMERO)
    Assertions.assertEquals(1, hakemukset.current.length)
    Assertions.assertEquals(0, hakemukset.old.length)
    val app = hakemukset.current.head
    Assertions.assertEquals("application-oid-1", app.oid)
    Assertions.assertEquals("Hajuton lomake", app.formName.fi)
    Assertions.assertTrue(app.haku.isEmpty)
    Assertions.assertTrue(app.hakukohteet.isEmpty)
    Assertions.assertTrue(app.ohjausparametrit.isEmpty)
    Mockito.verifyNoInteractions(koutaService, ohjausparametritService, vtsService)
  }

  @Disabled(value = "Enabloidaan kunnes ataru palauttaa tiedon processed processing lisäksi")
  @Test
  def applicationWithoutHakuAndHavingProcessingStatusIsPastApplication(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(OPPIJA_NUMERO))
      .thenReturn(hautonHakemus(false))
    val hakemukset = service.getHakemukset(OPPIJA_NUMERO)
    Assertions.assertEquals(1, hakemukset.current.length)
    Assertions.assertEquals(0, hakemukset.old.length)
    val app = hakemukset.current.head
    Assertions.assertEquals("application-oid-1", app.oid)
    Assertions.assertEquals("Hajuton lomake", app.formName.fi)
    Assertions.assertTrue(app.haku.isEmpty)
    Assertions.assertTrue(app.hakukohteet.isEmpty)
    Assertions.assertTrue(app.ohjausparametrit.isEmpty)
    Mockito.verifyNoInteractions(koutaService, ohjausparametritService, vtsService)
  }

  @Test
  def haullisetHakemuksetJotkaEivatOleKoutanEiPalauteta(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(OPPIJA_NUMERO))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                "application-oid-1",
                "mukahaku",
                List.empty,
                "secret-1",
                "2025-02-02T19:32:01Z",
                false,
                None,
                None,
                None,
                None,
                None,
                TranslatedName("Hajuton lomake", null, null),
                None,
                None,
                None,
                None
              )
            )
          )
        )
      )
    val hakemukset = service.getHakemukset(OPPIJA_NUMERO)
    Assertions.assertEquals(0, hakemukset.current.length)
    Assertions.assertEquals(0, hakemukset.old.length)
    Mockito.verifyNoInteractions(koutaService, ohjausparametritService, vtsService)
  }

  @Test
  def getHakemuksetThrowsWhenDeserializationFails(): Unit = {
    Mockito.when(ataruClient.getHakemukset(OPPIJA_NUMERO)).thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => service.getHakemukset(OPPIJA_NUMERO))
  }

  @Test
  def getHakemusOidsThrowsWhenDeserializationFails(): Unit = {
    Mockito.when(ataruClient.getHakemukset(OPPIJA_NUMERO)).thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => service.getHakemusOids(OPPIJA_NUMERO))
  }

  @Test
  def deserializesPaymentStateFromAtaruJson(): Unit = {
    val json =
      """
        [
          {
            "oid": "application-oid-1",
            "haku": null,
            "hakukohteet": [],
            "secret": "secret",
            "submitted": "2025-02-02T19:32:01Z",
            "processing": false,
            "paymentState": "not-required",
            "paymentDueDate": null,
            "paymentSum": null,
            "paymentReason": "eu-citizen",
            "paymentLink": null,
            "formName": {
              "fi": "Lomake",
              "sv": null,
              "en": null
            },
            "hakuaikaIsOn": null,
            "hakuaikaEnds": null,
            "email": "test@example.com",
            "asiointikieli": "fi"
          },
          {
            "oid": "application-oid-2",
            "haku": null,
            "hakukohteet": [],
            "secret": "secret",
            "submitted": "2025-02-02T19:32:01Z",
            "processing": false,
            "paymentState": "ok-by-proxy",
            "paymentDueDate": null,
            "paymentSum": null,
            "paymentReason": null,
            "paymentLink": null,
            "formName": {
              "fi": "Lomake",
              "sv": null,
              "en": null
            },
            "hakuaikaIsOn": null,
            "hakuaikaEnds": null,
            "email": "test@example.com",
            "asiointikieli": "fi"
          }
        ]
      """

    val applications =
      service.mapper.readValue(json, classOf[Array[Hakemus]])

    Assertions.assertEquals(2, applications.length)

    val notRequired = applications.find(_.oid == "application-oid-1").get
    Assertions.assertEquals(Some(Maksutila.notRequired), notRequired.paymentState)
    Assertions.assertEquals(Some("eu-citizen"), notRequired.paymentReason)

    val okByProxy = applications.find(_.oid == "application-oid-2").get
    Assertions.assertEquals(Some(Maksutila.OkByProxy), okByProxy.paymentState)
  }

  @Test
  def deserializesUnknownPaymentStateAsNone(): Unit = {
    val json =
      """
        [
          {
            "oid": "application-oid-1",
            "haku": null,
            "hakukohteet": [],
            "secret": "secret",
            "submitted": "2025-02-02T19:32:01Z",
            "processing": false,
            "paymentState": "unknown-state",
            "paymentDueDate": null,
            "paymentSum": null,
            "paymentReason": null,
            "paymentLink": null,
            "formName": {
              "fi": "Lomake",
              "sv": null,
              "en": null
            },
            "hakuaikaIsOn": null,
            "hakuaikaEnds": null,
            "email": "test@example.com",
            "asiointikieli": "fi"
          }
        ]
      """

    val applications =
      service.mapper.readValue(json, classOf[Array[Hakemus]])

    Assertions.assertEquals(1, applications.length)
    Assertions.assertEquals("application-oid-1", applications.head.oid)
    Assertions.assertEquals(None, applications.head.paymentState)
  }

  private def hautonHakemus(processing: Boolean) = {
    Right(
      objectMapper.writeValueAsString(
        Array(
          Hakemus(
            "application-oid-1",
            null,
            List.empty,
            "secret-1",
            "2025-02-02T19:32:01Z",
            processing,
            None,
            None,
            None,
            None,
            None,
            TranslatedName("Hajuton lomake", null, null),
            None,
            None,
            None,
            None
          )
        )
      )
    )
  }
}
