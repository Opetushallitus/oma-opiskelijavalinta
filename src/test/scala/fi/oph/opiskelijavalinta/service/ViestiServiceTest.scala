package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.Constants.OPH_ORGANISAATIO_OID
import fi.oph.opiskelijavalinta.TestUtils.{HAKEMUS_OID, HAKUKOHDE_OID, HAKU_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.clients.{LokalisointiClient, OnrClient}
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.{hakukohde1, kaynnissaOlevaHaku}
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import fi.oph.viestinvalitys.ViestinvalitysClient
import fi.oph.viestinvalitys.vastaanotto.model.{KayttooikeusImpl, Viesti}
import fi.oph.viestinvalitys.vastaanotto.resource.LuoViestiSuccessResponseImpl
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.ArgumentMatchers.any
import org.mockito.{ArgumentCaptor, Mockito}

import java.time.{LocalDateTime, ZoneId}
import java.util.UUID

@TestInstance(Lifecycle.PER_METHOD)
class ViestiServiceTest {

  val fileName: String         = "/test-translation.json"
  val fixedTime: LocalDateTime = LocalDateTime.of(2026, 4, 21, 12, 30, 0, 0)
  val text                     = scala.io.Source.fromInputStream(getClass.getResourceAsStream(fileName)).mkString
  val lokalisointiClient: LokalisointiClient = Mockito.mock(classOf[LokalisointiClient])

  val koutaService: KoutaService                 = Mockito.mock(classOf[KoutaService])
  val hakemuksetService: HakemuksetService       = Mockito.mock(classOf[HakemuksetService])
  val lokalisointiService: LokalisointiService   = LokalisointiService(lokalisointiClient)
  val onrClient: OnrClient                       = Mockito.mock(classOf[OnrClient])
  val viestinvalitysClient: ViestinvalitysClient = Mockito.mock(classOf[ViestinvalitysClient])
  val authorizationService: AuthorizationService = Mockito.mock(classOf[AuthorizationService])
  val viestiService: ViestiService               =
    new ViestiService(
      hakemuksetService,
      koutaService,
      lokalisointiService,
      onrClient,
      authorizationService,
      viestinvalitysClient
    ) {
      override protected def currentTime(): LocalDateTime = fixedTime
    }

  @Test
  def callsViestinvalitysWithRightParameters(): Unit = {
    initMocks
    Mockito
      .when(lokalisointiClient.getLokalisaatiot(SupportedLanguage.fi))
      .thenReturn(
        Right(text)
      )
    Mockito
      .when(hakemuksetService.getHakemusEmailAndLang(PERSON_OID, HAKEMUS_OID))
      .thenReturn(("testi.testinen@example.org", "fi"))
    Mockito
      .when(viestinvalitysClient.luoViesti(any()))
      .thenReturn(
        LuoViestiSuccessResponseImpl(
          UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
          UUID.fromString("5b4501ec-3298-4064-8868-262b55fdce9a")
        )
      )
    viestiService.lahetaVastaanottoViesti(HAKUKOHDE_OID, HAKEMUS_OID, HAKU_OID, "vastaanotto.vaihtoehdot.sitova")
    val captor = ArgumentCaptor.forClass(classOf[fi.oph.viestinvalitys.vastaanotto.model.Viesti])
    Mockito.verify(viestinvalitysClient).luoViesti(captor.capture())
    val sentMessage = captor.getValue
    Assertions.assertTrue(sentMessage.getOtsikko.get().contains("Opintopolku: Vastauksesi on vastaanotettu"))
    Assertions.assertTrue(sentMessage.getKielet.get().contains("fi"))
    Assertions.assertEquals(
      KayttooikeusImpl(
        java.util.Optional.of("APP_VIESTINVALITYS_OPH_PAAKAYTTAJA"),
        java.util.Optional.of(OPH_ORGANISAATIO_OID)
      ),
      sentMessage.getKayttooikeusRajoitukset.get().get(0)
    )
    Assertions.assertEquals(365, sentMessage.getSailytysaika.get())
    Assertions.assertEquals("normaali", sentMessage.getPrioriteetti.get())
    val vastaanottajat = sentMessage.getVastaanottajat
    Assertions.assertEquals(1, vastaanottajat.get.size())
    Assertions.assertEquals("testi.testinen@example.org", vastaanottajat.get.get(0).getSahkopostiOsoite.get())
    Assertions.assertEquals("oma-opiskelijavalinta", sentMessage.getLahettavaPalvelu.get())
    Assertions.assertTrue(sentMessage.getSisalto.get().contains("Hei Testi Testinen,"))
    Assertions.assertTrue(sentMessage.getSisalto.get().contains("21.4.2026 klo 12:30"))
    Assertions.assertTrue(
      sentMessage.getSisalto
        .get()
        .contains(
          "vastauksesi:<br /><br />Otan paikan vastaan sitovasti - Leikkipuisto, Liukumäki - Liukumäen lisensiaatti<br /><br />(Leikkipuiston jatkuva haku)<br /><br />Älä vastaa tähän viestiin - viesti on lähetetty automaattisesti."
        )
    )
  }

  @Test
  def addsLocalizedSvDateToMessage(): Unit = {
    initMocks
    Mockito
      .when(lokalisointiClient.getLokalisaatiot(SupportedLanguage.sv))
      .thenReturn(
        Right(text)
      )
    Mockito
      .when(hakemuksetService.getHakemusEmailAndLang(PERSON_OID, HAKEMUS_OID))
      .thenReturn(("testi.testinen@example.org", "sv"))

    viestiService.lahetaVastaanottoViesti(HAKUKOHDE_OID, HAKEMUS_OID, HAKU_OID, "vastaanotto.vaihtoehdot.sitova")
    val captor = ArgumentCaptor.forClass(classOf[Viesti])
    Mockito.verify(viestinvalitysClient).luoViesti(captor.capture())
    val sentMessage = captor.getValue
    Assertions.assertTrue(sentMessage.getSisalto.get().contains("21.4.2026 kl. 12:30"))
  }

  @Test
  def addsLocalizedEnUsDateToMessage(): Unit = {
    initMocks
    Mockito
      .when(lokalisointiClient.getLokalisaatiot(SupportedLanguage.en))
      .thenReturn(
        Right(text)
      )
    Mockito
      .when(hakemuksetService.getHakemusEmailAndLang(PERSON_OID, HAKEMUS_OID))
      .thenReturn(("testi.testinen@example.org", "en"))

    viestiService.lahetaVastaanottoViesti(HAKUKOHDE_OID, HAKEMUS_OID, HAKU_OID, "vastaanotto.vaihtoehdot.sitova")
    val captor = ArgumentCaptor.forClass(classOf[Viesti])
    Mockito.verify(viestinvalitysClient).luoViesti(captor.capture())
    val sentMessage = captor.getValue
    Assertions.assertTrue(sentMessage.getSisalto.get().contains("Apr. 21, 2026 at 12:30 PM EEST"))
  }

  private def initMocks = {
    Mockito.when(authorizationService.getPersonOid).thenReturn(Some(PERSON_OID))
    Mockito
      .when(koutaService.getHaku(HAKU_OID))
      .thenReturn(Some(kaynnissaOlevaHaku))
    Mockito
      .when(koutaService.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Some(hakukohde1))
    Mockito.when(onrClient.getPersonInfo(PERSON_OID)).thenReturn(Oppija(PERSON_OID, "010190", "Testi", "Testinen"))
    Mockito
      .when(viestinvalitysClient.luoViesti(any()))
      .thenReturn(
        LuoViestiSuccessResponseImpl(
          UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
          UUID.fromString("5b4501ec-3298-4064-8868-262b55fdce9a")
        )
      )
  }

  @Test
  def throwsViestinvalitysExceptionWhenError(): Unit = {
    Mockito
      .when(authorizationService.getPersonOid)
      .thenThrow(RuntimeException())
    Assertions.assertThrows(
      classOf[ViestinvalitysException],
      () =>
        viestiService.lahetaVastaanottoViesti(HAKUKOHDE_OID, HAKEMUS_OID, HAKU_OID, "vastaanotto.vaihtoehdot.sitova")
    )
    Mockito.verifyNoInteractions(viestinvalitysClient)
  }
}
