package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{
  linkUser,
  objectMapper,
  oppijaUser,
  HAKEMUS_OID,
  HAKUKOHDE_OID,
  HAKUKOHDE_OID_2,
  HAKU_OID,
  PERSON_OID
}
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.{
  hakuaikaPaattynytHaku,
  hakukohde1,
  hakukohde2,
  kaynnissaOlevaHaku
}
import fi.oph.opiskelijavalinta.mockdata.OhjausparametritMockData.{
  hakukierrosPaattyyTulevaisuudessaMock,
  mennytTimestamp,
  paattynytHakukierrosMock
}
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.*
import fi.oph.opiskelijavalinta.model.{HakemuksetEnriched, Hakemus, HakemusEnriched, TranslatedName}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class HakemuksetIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.HAKEMUKSET_PATH)
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def returnsApplicationsOfUser(): Unit = {
    Mockito.reset(valintaTulosServiceClient)
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakuaikaPaattynytHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID_2))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde2)))

    Mockito.when(ohjausparametritService.getOhjausparametritForHaku(HAKU_OID)).thenReturn(paattynytHakukierrosMock)
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.HAKEMUKSET_PATH)
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val hakemukset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemuksetEnriched])
    Assertions.assertEquals(1, hakemukset.old.length)
    Assertions.assertEquals(0, hakemukset.current.length)
    val app = hakemukset.old.head
    assertHakemus(app)
    Assertions.assertEquals(mennytTimestamp, app.ohjausparametrit.get.hakukierrosPaattyy.get)
    Mockito.verifyNoInteractions(valintaTulosServiceClient)
    Assertions.assertEquals(List.empty, app.hakemuksenTulokset)
  }

  @Test
  def returnsOnlyLinkedApplicationOfUserWithLinkRole(): Unit = {
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
                TranslatedName("LinkkiLomake", "Samma på svenska", "Linkform"),
                None,
                None
              ),
              Hakemus(
                "1.23.4.5",
                null,
                List.empty,
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("WanhaLomake", "Gamla form", "Oldform"),
                None,
                None
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
    Mockito.when(ohjausparametritService.getOhjausparametritForHaku(HAKU_OID)).thenReturn(paattynytHakukierrosMock)
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.HAKEMUKSET_PATH)
          .`with`(user(linkUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val hakemukset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemuksetEnriched])
    Assertions.assertEquals(0, hakemukset.current.length)
    Assertions.assertEquals(1, hakemukset.old.length)
    val app = hakemukset.old.head
    Assertions.assertEquals("LinkkiLomake", app.formName.fi)
    assertHakemus(app)
    Assertions.assertEquals(mennytTimestamp, app.ohjausparametrit.get.hakukierrosPaattyy.get)
  }

  @Test
  def returnsPublishedVTSResultsForApplications(): Unit = {
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
    assertHakemus(app)
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    val hakutoive1 = app.hakemuksenTulokset.headOption.getOrElse(
      fail("No hakemuksenTulokset returned")
    )
    Assertions.assertEquals("HYVAKSYTTY", hakutoive1.valintatila.get)
    Assertions.assertEquals("VASTAANOTETTAVISSA_SITOVASTI", hakutoive1.vastaanotettavuustila.get)
    Assertions.assertEquals("KESKEN", hakutoive1.vastaanottotila.get)
    Assertions.assertEquals("2025-12-12T13:00:00Z", hakutoive1.vastaanottoDeadline.get)
    val hakutoive2 = app.hakemuksenTulokset
      .find(_.hakukohdeOid.contains("hakukohde-oid-2"))
    Assertions.assertEquals(None, hakutoive2)
  }

  @Test
  def doesNotReturnUnpublishedVTSResults(): Unit = {
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
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSKeskenResponse)))
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
    assertHakemus(app)
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    Assertions.assertEquals(List.empty, app.hakemuksenTulokset)
  }

  @Test
  def doesNotReturnKeskenResultWhenHakuaikaIsOver(): Unit = {
    Mockito
      .when(ohjausparametritService.getOhjausparametritForHaku(HAKU_OID))
      .thenReturn(hakukierrosPaattyyTulevaisuudessaMock)
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSKeskenResponse)))
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
    assertHakemus(app)
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    Assertions.assertEquals(List.empty, app.hakemuksenTulokset)
  }

  private def assertHakemus(app: HakemusEnriched): Unit = {
    Assertions.assertEquals(HAKEMUS_OID, app.oid)
    Assertions.assertEquals("1.2.246.562.29.00000000000000038404", app.haku.get.oid)
    Assertions.assertEquals("Leikkipuiston jatkuva haku", app.haku.get.nimi.fi)
    Assertions.assertEquals("Playground search", app.haku.get.nimi.en)
    Assertions.assertEquals("Samma på svenska", app.haku.get.nimi.sv)
    val hakukohteet = app.hakukohteet.map(a => a.get).toSeq
    Assertions.assertEquals("1.2.246.562.29.00000000000000065738", hakukohteet(0).oid)
    Assertions.assertEquals("Liukumäen lisensiaatti", hakukohteet(0).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Liukumäki", hakukohteet(0).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals("1.2.246.562.29.00000000000000065739", hakukohteet(1).oid)
    Assertions.assertEquals("Hiekkalaatikon arkeologi", hakukohteet(1).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Hiekkalaatikko", hakukohteet(1).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ilmoittautuminenPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ehdollisetValinnatPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.opiskelijanPaikanVastaanottoPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoilleAlkaa)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoillePaattyy)
  }
}
