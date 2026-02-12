package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.clients.ValintaTulosServiceClient
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.{ehdollinenTulos, hakutoiveEhdollisestiHyvaksytty}
import fi.oph.opiskelijavalinta.model.{KoodistoKoodi, KoodistoMetadata}
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_CLASS)
class VTSServiceTest {

  val vtsClient: ValintaTulosServiceClient = Mockito.mock(classOf[ValintaTulosServiceClient])

  val HAKU_OID    = "HAKU-OID-1"
  val HAKEMUS_OID = "HAKEMUS-OID-1"

  val mockKoodistoService = Mockito.mock(classOf[KoodistoService])
  val vtsService          = VTSService(vtsClient, mockKoodistoService)

  @Test
  def returnsEhdollisuudenSyyFromKoodisto(): Unit = {
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
    val tulos = vtsService.getValinnanTulokset(HAKU_OID, HAKEMUS_OID)
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
    val tulos = vtsService.getValinnanTulokset(HAKU_OID, HAKEMUS_OID)
    Assertions.assertFalse(tulos.isEmpty)
    Assertions.assertFalse(tulos.get.hakutoiveet.isEmpty)
    val hakutoiveenTulosEnriched = tulos.get.hakutoiveet.head
    Assertions.assertEquals(true, hakutoiveenTulosEnriched.ehdollisestiHyvaksyttavissa.getOrElse(false))
    Assertions.assertFalse(hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.isEmpty)
    Assertions.assertEquals("Muu syy", hakutoiveenTulosEnriched.ehdollisenHyvaksymisenEhto.get.fi)
  }

}
