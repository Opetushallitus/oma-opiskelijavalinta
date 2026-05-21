package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{HAKEMUS_OID, HAKUKOHDE_OID, HAKUKOHDE_OID_2, HAKU_OID, PERSON_OID, linkUser, objectMapper, oppijaUser, userWithoutPersonOid}
import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.{hakuaikaPaattynytHaku, hakukohde1, hakukohde2, kaynnissaOlevaHaku}
import fi.oph.opiskelijavalinta.mockdata.OhjausparametritMockData.{hakukierrosPaattyyTulevaisuudessaMock, mennytTimestamp, paattynytHakukierrosMock}
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.*
import fi.oph.opiskelijavalinta.model.{HakemuksetEnriched, Hakemus, HakemusEnriched, PaatettavaOpiskeluOikeus, PaatettavatOpiskeluOikeudetResponse, TranslatedName}
import fi.oph.opiskelijavalinta.util.SupportedLanguage
import fi.oph.viestinvalitys.vastaanotto.resource.LuoViestiSuccessResponseImpl
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.ArgumentMatchers.{any, eq}
import org.mockito.Mockito
import org.mockito.Mockito.times
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util.UUID

class YosIntegrationTest extends BaseIntegrationTest {

  @BeforeEach
  def resetMocks(): Unit = {
    Mockito.reset(viestinvalitysClient, koutaClient, valintaTulosServiceClient, lokalisointiClient, supaClient)
  }
  
  @Test
  def palauttaaPaatettavatOpiskeluOikeudetTulostenKanssa(): Unit = {
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(kaynnissaOlevaHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID_2))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde2)))
    Mockito
      .when(ohjausparametritService.getOhjausparametritForHaku(HAKU_OID))
      .thenReturn(hakukierrosPaattyyTulevaisuudessaMock)
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSResponse)))
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(PaatettavatOpiskeluOikeudetResponse(Some(List(
        PaatettavaOpiskeluOikeus(
          virtaOpiskeluOikeusId = "virtaOikeusId",
          organisaatioOid = "1.2.3.4.5",
          organisaatioNimi = TranslatedName("Daculan AMK", "", ""),
          virtaNimi = TranslatedName("Daculan hattu", "", ""),
          supaNimi = TranslatedName("Hatunlierintekijän koulutus", "", ""))
      )), None, None))))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.HAKEMUKSET_PATH)
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val hakemukset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemuksetEnriched])
    Assertions.assertEquals(1, hakemukset.current.length)
    Assertions.assertEquals(0, hakemukset.old.length)
    val app = hakemukset.current.head
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    val hakutoive1 = app.hakemuksenTulokset.find(_.hakukohdeOid.contains(HAKUKOHDE_OID)).get
    Assertions.assertEquals("HYVAKSYTTY", hakutoive1.valintatila.get)
    Assertions.assertEquals("VASTAANOTETTAVISSA_SITOVASTI", hakutoive1.vastaanotettavuustila.get)
    Assertions.assertEquals("KESKEN", hakutoive1.vastaanottotila.get)
    Assertions.assertEquals("2025-12-12T13:00:00Z", hakutoive1.vastaanottoDeadline.get)
    Assertions.assertFalse(hakutoive1.paatettavatOpiskeluOikeudet.isEmpty)

    val hakutoive2 = app.hakemuksenTulokset
      .find(_.hakukohdeOid.contains("hakukohde-oid-2")).get
    Assertions.assertEquals("KESKEN", hakutoive2.valintatila.get)
    Assertions.assertTrue(hakutoive2.paatettavatOpiskeluOikeudet.isEmpty)
  }

  @Test
  def tekeeVastaanotonLahettaenPaatettavatOpiskeluOikeudet(): Unit = {
    Mockito.reset(valintaTulosServiceClient)
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(kaynnissaOlevaHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID_2))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde2)))
    Mockito
      .when(ohjausparametritService.getOhjausparametritForHaku(HAKU_OID))
      .thenReturn(hakukierrosPaattyyTulevaisuudessaMock)
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSResponse)))
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(PaatettavatOpiskeluOikeudetResponse(Some(List(
        PaatettavaOpiskeluOikeus(
          virtaOpiskeluOikeusId = "virtaOikeusId",
          organisaatioOid = "1.2.3.4.5",
          organisaatioNimi = TranslatedName("Daculan AMK", "", ""),
          virtaNimi = TranslatedName("Daculan hattu", "", ""),
          supaNimi = TranslatedName("Hatunlierintekijän koulutus", "", ""))
      )), None, None))))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.HAKEMUKSET_PATH)
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val hakemukset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemuksetEnriched])
    Assertions.assertEquals(1, hakemukset.current.length)

    val vastaanottoDTO = VastaanottoDTO(
      "VastaanotaSitovasti",
      HAKU_OID,
      "vastaanotto.vaihtoehdot.sitova"
    )
    initProperVastaanotto()
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(vastaanottoDTO))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
    
    Mockito.verify(valintaTulosServiceClient, times(1)).postVastaanotto(HAKEMUS_OID, HAKUKOHDE_OID, "VastaanotaSitovasti", List(PaatettavaOpiskeluOikeus(
      virtaOpiskeluOikeusId = "virtaOikeusId",
      organisaatioOid = "1.2.3.4.5",
      organisaatioNimi = TranslatedName("Daculan AMK", "", ""),
      virtaNimi = TranslatedName("Daculan hattu", "", ""),
      supaNimi = TranslatedName("Hatunlierintekijän koulutus", "", ""))))
  }

  def initProperVastaanotto(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                HAKEMUS_OID,
                HAKU_OID,
                List(HAKUKOHDE_OID, HAKUKOHDE_OID_2),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                None,
                None,
                Some("testi.kayttaja@example.org"),
                Some("fi")
              )
            )
          )
        )
      )
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(kaynnissaOlevaHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID_2))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde2)))
    Mockito.when(onrClient.getPersonInfo(PERSON_OID)).thenReturn(Oppija(PERSON_OID, "010190", "Testi", "Testinen"))
    Mockito
      .when(valintaTulosServiceClient.postVastaanotto(any(), any(), any(), any()))
      .thenReturn(Right("OK"))
    val fileName: String = "/test-translation.json"
    val text = scala.io.Source.fromInputStream(getClass.getResourceAsStream(fileName)).mkString
    Mockito
      .when(lokalisointiClient.getLokalisaatiot(SupportedLanguage.fi))
      .thenReturn(
        Right(text)
      )
    Mockito
      .when(viestinvalitysClient.luoViesti(any()))
      .thenReturn(
        LuoViestiSuccessResponseImpl(
          UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
          UUID.fromString("5b4501ec-3298-4064-8868-262b55fdce9a")
        )
      )
  }

}
