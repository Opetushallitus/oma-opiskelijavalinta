package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, HAKUKOHDE_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.clients.ValintaTulosServiceClient
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.{
  ehdollinenTulos,
  hakutoive1Hyvaksytty,
  hakutoiveEhdollisestiHyvaksytty
}
import fi.oph.opiskelijavalinta.model.{
  Haku,
  Hakuaika,
  Hakukohde,
  Ilmoittautumistapa,
  Ilmoittautumistila,
  KoodistoKoodi,
  KoodistoMetadata,
  PaateltyAlkamisajankohta,
  PaateltyAlkamiskausi,
  PaatettavaOpiskeluOikeus,
  TranslatedName
}
import fi.oph.opiskelijavalinta.security.{MigriJsonWebToken, OiliJsonWebToken}
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class VTSServiceTest {

  val vtsClient: ValintaTulosServiceClient = Mockito.mock(classOf[ValintaTulosServiceClient])

  val HAKIJA_OID  = "HAKIJA_OID-1"
  val HAKU_OID    = "HAKU-OID-1"
  val HAKEMUS_OID = "HAKEMUS-OID-1"

  val mockKoodistoService: KoodistoService = Mockito.mock(classOf[KoodistoService])
  val mockSupaService: SupaService         = Mockito.mock(classOf[SupaService])
  val mockKoutaService: KoutaService       = Mockito.mock(classOf[KoutaService])
  val migriToken: MigriJsonWebToken        = Mockito.mock(classOf[MigriJsonWebToken])
  val oiliToken: OiliJsonWebToken          = Mockito.mock(classOf[OiliJsonWebToken])
  val vtsService                           =
    VTSService(vtsClient, mockKoodistoService, mockSupaService, mockKoutaService, migriToken, oiliToken)

  val hakuYosPiirissa: Haku = Haku(
    HAKU_OID,
    TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search"),
    "hakutapa_01",
    "haunkohdejoukko_20",
    Seq(Hakuaika("2026-08-01T00:00:00", "2026-09-01T00:00:00"))
  )

  val hakukohdeYosPiirissa: Hakukohde = Hakukohde(
    HAKUKOHDE_OID,
    TranslatedName("Liukumäen lisensiaatti", "", ""),
    TranslatedName("Leikkipuisto, Liukumäki", "", ""),
    None,
    Some(PaateltyAlkamiskausi(kausiUri = Some("kausi_k"))),
    Some(PaateltyAlkamisajankohta(pvm = Some("2027-01-01"), henkilokohtainenSuunnitelma = false))
  )

  val hakuEiYosPiirissa: Haku = hakuYosPiirissa.copy(
    hakuajat = Seq(Hakuaika("2024-01-01T00:00:00", "2024-02-01T00:00:00"))
  )

  @Test
  def returnsEhdollisuudenSyyFromKoodisto(): Unit = {
    Mockito.when(mockKoutaService.getHaku(HAKU_OID)).thenReturn(hakuEiYosPiirissa)
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos
          )
        )
      )
    Mockito
      .when(mockKoodistoService.getKooditForKoodisto("hyvaksynnanehdot"))
      .thenReturn(
        Seq(
          KoodistoKoodi(
            "ltt",
            List(
              KoodistoMetadata("Ehdollinen: lopullinen tutkintotodistus toimitettava määräaikaan mennessä", "FI"),
              KoodistoMetadata("Villkor: lämna in ditt slutliga examensbetyg inom utsatt tid", "SV"),
              KoodistoMetadata("Condition: Submit your final qualification certificate by the deadline", "EN")
            )
          )
        )
      )
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Assertions.assertFalse(tulos.isEmpty)
    Assertions.assertFalse(tulos.get.hakutoiveet.isEmpty)
    val hakutoiveenTulosEnriched = tulos.get.hakutoiveet.head
    Assertions.assertEquals(true, hakutoiveenTulosEnriched.ehdollisestiHyvaksyttavissa.getOrElse(false))
    Assertions.assertFalse(hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.isEmpty)
    Assertions.assertEquals(
      "Ehdollinen: lopullinen tutkintotodistus toimitettava määräaikaan mennessä",
      hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.get.fi
    )
  }

  @Test
  def doesNotCallKoodistoIfEhdollisuudenSyyMuu(): Unit = {
    Mockito.when(mockKoutaService.getHaku(HAKU_OID)).thenReturn(hakuEiYosPiirissa)
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos.copy(
              hakutoiveet = List(
                hakutoiveEhdollisestiHyvaksytty.copy(
                  ehdollisenHyvaksymisenEhtoKoodi = Some("muu"),
                  ehdollisenHyvaksymisenEhtoFI = Some("Muu syy"),
                  ehdollisenHyvaksymisenEhtoSV = Some("Muu syy SV"),
                  ehdollisenHyvaksymisenEhtoEN = Some("Muu syy EN")
                )
              )
            )
          )
        )
      )
    Mockito.verifyNoInteractions(mockKoodistoService)
    Mockito.verifyNoInteractions(mockSupaService)
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Assertions.assertFalse(tulos.isEmpty)
    Assertions.assertFalse(tulos.get.hakutoiveet.isEmpty)
    val hakutoiveenTulosEnriched = tulos.get.hakutoiveet.head
    Assertions.assertEquals(true, hakutoiveenTulosEnriched.ehdollisestiHyvaksyttavissa.getOrElse(false))
    Assertions.assertFalse(hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.isEmpty)
    Assertions.assertEquals("Muu syy", hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.get.fi)
  }

  @Test
  def addsMigriTokenToMigriUrl(): Unit = {
    Mockito.when(migriToken.createMigriJWT(PERSON_OID)).thenReturn("MIGRI_TOKEN")
    val tulos =
      vtsService.addJwtsForLinkUserIfNecessary(PERSON_OID, hakutoive1Hyvaksytty.copy(showMigriURL = Some(true)))
    Assertions.assertTrue(tulos.migriURL.get.contains("MIGRI_TOKEN"))
    Mockito.verifyNoInteractions(oiliToken)
  }

  @Test
  def throwsExceptionWhenDeserializationFails(): Unit = {
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right("invalid json"))
    Assertions.assertThrows(
      classOf[RuntimeException],
      () => vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    )
  }

  @Test
  def addsOiliTokenToIlmoittautumisUrl(): Unit = {
    Mockito.when(oiliToken.createOiliJWT(PERSON_OID)).thenReturn("OILI_TOKEN")
    val tulos = vtsService.addJwtsForLinkUserIfNecessary(
      PERSON_OID,
      hakutoive1Hyvaksytty.copy(ilmoittautumistila =
        Some(
          Ilmoittautumistila(
            ilmoittautumisaika = None,
            ilmoittautumistila = None,
            ilmoittauduttavissa = Some(true),
            ilmoittautumistapa =
              Some(Ilmoittautumistapa(url = Some("/oili"), nimi = Some(TranslatedName("Oili", "Oili", "Oili"))))
          )
        )
      )
    )
    Assertions.assertEquals("/oili?token=OILI_TOKEN", tulos.ilmoittautumistila.get.ilmoittautumistapa.get.url.get)
    Mockito.verifyNoInteractions(migriToken)
  }

  @Test
  def palauttaaPaatettavatOpiskeluOikeudetTulokselleJokaOnVastaanotettavissa(): Unit = {
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos.copy(hakutoiveet =
              List(
                hakutoiveEhdollisestiHyvaksytty.copy(
                  hakukohdeOid = Some(HAKUKOHDE_OID),
                  ehdollisestiHyvaksyttavissa = Some(false)
                )
              )
            )
          )
        )
      )
    Mockito.when(mockKoutaService.getHaku(HAKU_OID)).thenReturn(hakuYosPiirissa)
    Mockito
      .when(mockKoutaService.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(hakukohdeYosPiirissa)
    Mockito
      .when(mockSupaService.haePaattyvatOpiskeluOikeudet(HAKIJA_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(
        List(
          PaatettavaOpiskeluOikeus(
            virtaOpiskeluOikeusId = "nuke-tunniste",
            organisaatioOid = "",
            organisaatioNimi = TranslatedName("NukeTehdas", "", ""),
            supaNimi = TranslatedName("Räjäyttäjä", "", ""),
            virtaNimi = TranslatedName("", "", "")
          )
        )
      )
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Assertions.assertEquals(1, tulos.get.hakutoiveet.head.paatettavatOpiskeluOikeudet.size)
    val oikeus = tulos.get.hakutoiveet.head.paatettavatOpiskeluOikeudet.head
    Assertions.assertEquals("NukeTehdas", oikeus.organisaatioNimi.fi)
    Assertions.assertEquals("Räjäyttäjä", oikeus.supaNimi.fi)
    Assertions.assertEquals(false, tulos.get.hakutoiveet.head.yosCheckFailed)
  }

  @Test
  def palauttaaTiedonJosPaatettavienOpiskeluoikeuksienHakuEpaonnistui(): Unit = {
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos.copy(hakutoiveet =
              List(
                hakutoiveEhdollisestiHyvaksytty.copy(
                  hakukohdeOid = Some(HAKUKOHDE_OID),
                  ehdollisestiHyvaksyttavissa = Some(false)
                )
              )
            )
          )
        )
      )
    Mockito.when(mockKoutaService.getHaku(HAKU_OID)).thenReturn(hakuYosPiirissa)
    Mockito
      .when(mockKoutaService.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(hakukohdeYosPiirissa)
    Mockito
      .when(mockSupaService.haePaattyvatOpiskeluOikeudet(HAKIJA_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenThrow(RuntimeException())
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Assertions.assertTrue(tulos.get.hakutoiveet.head.paatettavatOpiskeluOikeudet.isEmpty)
    Assertions.assertEquals(true, tulos.get.hakutoiveet.head.yosCheckFailed)
  }

  @Test
  def eiKutsuSupaaJosHakuaikaAlkaaEnnenElokuuta2026(): Unit = {
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos.copy(hakutoiveet =
              List(
                hakutoiveEhdollisestiHyvaksytty.copy(
                  hakukohdeOid = Some(HAKUKOHDE_OID),
                  ehdollisestiHyvaksyttavissa = Some(false)
                )
              )
            )
          )
        )
      )
    Mockito
      .when(mockKoutaService.getHaku(HAKU_OID))
      .thenReturn(
        hakuYosPiirissa
          .copy(hakuajat = Seq(Hakuaika("2026-07-31T23:59:59", "2026-09-01T00:00:00")))
      )
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Mockito.verifyNoInteractions(mockSupaService)
    Mockito.verify(mockKoutaService, Mockito.never()).getHakukohde(HAKUKOHDE_OID)
    Assertions.assertTrue(tulos.get.hakutoiveet.head.paatettavatOpiskeluOikeudet.isEmpty)
    Assertions.assertEquals(false, tulos.get.hakutoiveet.head.yosCheckFailed)
  }

  @Test
  def eiKutsuSupaaJosKoulutuksenAlkamisvuosiOnEnnenVuotta2027(): Unit = {
    Mockito
      .when(vtsClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            ehdollinenTulos.copy(hakutoiveet =
              List(
                hakutoiveEhdollisestiHyvaksytty.copy(
                  hakukohdeOid = Some(HAKUKOHDE_OID),
                  ehdollisestiHyvaksyttavissa = Some(false)
                )
              )
            )
          )
        )
      )
    Mockito.when(mockKoutaService.getHaku(HAKU_OID)).thenReturn(hakuYosPiirissa)
    Mockito
      .when(mockKoutaService.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(
        hakukohdeYosPiirissa.copy(paateltyAlkamisajankohta =
          Some(PaateltyAlkamisajankohta(pvm = Some("2026-12-31"), henkilokohtainenSuunnitelma = false))
        )
      )
    val tulos = vtsService.getValinnanTulokset(HAKIJA_OID, HAKU_OID, HAKEMUS_OID)
    Mockito.verifyNoInteractions(mockSupaService)
    Assertions.assertTrue(tulos.get.hakutoiveet.head.paatettavatOpiskeluOikeudet.isEmpty)
    Assertions.assertEquals(false, tulos.get.hakutoiveet.head.yosCheckFailed)
  }
}
