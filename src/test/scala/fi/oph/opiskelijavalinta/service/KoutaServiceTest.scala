package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.Constants.KOULUTUKSEN_ALKAMISKAUSI_KEVAT
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, HAKUKOHDE_OID, HAKU_OID}
import fi.oph.opiskelijavalinta.clients.KoutaClient
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.hakukohde1
import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, PaateltyAlkamisajankohta, PaateltyAlkamiskausi, TranslatedName}
import fi.oph.opiskelijavalinta.util.TimeUtils
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.TestInstance.Lifecycle

import java.time.ZonedDateTime

@TestInstance(Lifecycle.PER_CLASS)
class KoutaServiceTest {

  val koutaClient: KoutaClient          = Mockito.mock(classOf[KoutaClient])
  val cachedService: CachedKoutaService = CachedKoutaService(koutaClient)

  val koutaService: KoutaService = KoutaService(cachedService)

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

  @Test
  def returnsHakuForHakemus(): Unit = {
    val haku = koutaService.getHaku(HAKU_OID)
    Assertions.assertEquals(HAKU_OID, haku.oid)
    Assertions.assertEquals("Purkanpurijoiden haku", haku.nimi.fi)
    Assertions.assertEquals("Samma på svenska", haku.nimi.sv)
    Assertions.assertEquals("Gumchewer search", haku.nimi.en)
  }

  @Test
  def throwsWhenHakuClientFails(): Unit = {
    Mockito.when(koutaClient.getHaku(HAKU_OID)).thenReturn(Left(RuntimeException("verkkovirhe")))
    Assertions.assertThrows(classOf[RuntimeException], () => koutaService.getHaku(HAKU_OID))
  }

  @Test
  def throwsWhenHakuDeserializationFails(): Unit = {
    Mockito.when(koutaClient.getHaku(HAKU_OID)).thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => koutaService.getHaku(HAKU_OID))
  }

  @Test
  def throwsWhenHakukohdeClientFails(): Unit = {
    val hakukohdeOid = "HAKUKOHDE-OID-1"
    Mockito.when(koutaClient.getHakukohde(hakukohdeOid)).thenReturn(Left(RuntimeException("verkkovirhe")))
    Assertions.assertThrows(classOf[RuntimeException], () => koutaService.getHakukohde(hakukohdeOid))
  }

  @Test
  def throwsWhenHakukohdeDeserializationFails(): Unit = {
    val hakukohdeOid = "HAKUKOHDE-OID-1"
    Mockito.when(koutaClient.getHakukohde(hakukohdeOid)).thenReturn(Right("invalid json"))
    Assertions.assertThrows(classOf[RuntimeException], () => koutaService.getHakukohde(hakukohdeOid))
  }

  @Test
  def returnsHakukohde(): Unit = {
    Mockito.when(koutaClient.getHakukohde(HAKUKOHDE_OID)).thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    val hakukohde = koutaService.getHakukohde(HAKUKOHDE_OID)
    assertEquals(HAKUKOHDE_OID, hakukohde.oid)
    assertEquals("Liukumäen lisensiaatti", hakukohde.nimi.fi)
    assertEquals("Leikkipuisto, Liukumäki", hakukohde.jarjestyspaikkaHierarkiaNimi.fi)
    assertEquals(KOULUTUKSEN_ALKAMISKAUSI_KEVAT, hakukohde.paateltyAlkamiskausi.get.kausiUri.get)
    assertFalse(hakukohde.yhdenPaikanSaanto.voimassa)
  }

  @Test
  def returnsEnrichedHakukohde(): Unit = {
    Mockito.when(koutaClient.getHakukohde(HAKUKOHDE_OID)).thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    val hakukohde = koutaService.getEnrichedHakukohde(HAKUKOHDE_OID)
    assertFalse(hakukohde.isEmpty)
    assertEquals(HAKUKOHDE_OID, hakukohde.get.oid)
    assertEquals("Liukumäen lisensiaatti", hakukohde.get.nimi.fi)
    assertEquals("Leikkipuisto, Liukumäki", hakukohde.get.jarjestyspaikkaHierarkiaNimi.fi)
    assertEquals(KOULUTUKSEN_ALKAMISKAUSI_KEVAT, hakukohde.get.koulutuksenAlkamiskausi.get)
    assertFalse(hakukohde.get.yhdenPaikanSaanto.voimassa)
    assertEquals("2029-01-01", hakukohde.get.koulutuksenAlkamisPvm.get)
  }

  @Test
  def alkamisAjankohtanaKaytetaanEilistaJosPvmMenneisyydessa(): Unit = {
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            hakukohde1.copy(paateltyAlkamisajankohta = Some(PaateltyAlkamisajankohta("2024-01-01", true)))
          )
        )
      )
    val hakukohde = koutaService.getEnrichedHakukohde(HAKUKOHDE_OID)
    val yesterday = ZonedDateTime.now(TimeUtils.ZONE_FINLAND).minusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)
    assertEquals(yesterday, hakukohde.get.koulutuksenAlkamisPvm.get)
  }

  @Test
  def alkamisAjankohtanaKaytetaanAnnettuaJosPvmTulevaisuudessa(): Unit = {
    val tulevaisuus = ZonedDateTime.now(TimeUtils.ZONE_FINLAND).plusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            hakukohde1.copy(paateltyAlkamisajankohta = Some(PaateltyAlkamisajankohta(tulevaisuus, false)))
          )
        )
      )
    val hakukohde = koutaService.getEnrichedHakukohde(HAKUKOHDE_OID)
    assertEquals(tulevaisuus, hakukohde.get.koulutuksenAlkamisPvm.get)
  }

  @Test
  def alkamisAjankohtanaKaytetaanEilistäJosHenkilokohtainenSuunnitelma(): Unit = {
    val tulevaisuus = ZonedDateTime.now(TimeUtils.ZONE_FINLAND).plusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            hakukohde1.copy(paateltyAlkamisajankohta = Some(PaateltyAlkamisajankohta(tulevaisuus, true)))
          )
        )
      )
    val hakukohde = koutaService.getEnrichedHakukohde(HAKUKOHDE_OID)
    val yesterday = ZonedDateTime.now(TimeUtils.ZONE_FINLAND).minusDays(1).format(TimeUtils.KOUTA_DATE_FORMATTER)
    assertEquals(yesterday, hakukohde.get.koulutuksenAlkamisPvm.get)
  }
}
