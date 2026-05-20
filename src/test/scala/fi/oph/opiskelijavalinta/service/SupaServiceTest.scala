package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.TestUtils.{HAKUKOHDE_OID, HAKU_OID, PERSON_OID, objectMapper}
import fi.oph.opiskelijavalinta.clients.SuoritusPalveluClient
import fi.oph.opiskelijavalinta.model.YosVirhe.VIRHE_HAKUTOIVEEN_PAATTELYSSA
import fi.oph.opiskelijavalinta.model.{PaatettavaOpiskeluOikeus, PaatettavatOpiskeluOikeudetResponse, TranslatedName}
import org.junit.jupiter.api.{Assertions, Test, TestInstance}
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito
import slick.jdbc.JdbcBackend.JdbcDatabaseDef

@TestInstance(Lifecycle.PER_METHOD)
class SupaServiceTest {

  val supaClient: SuoritusPalveluClient = Mockito.mock(classOf[SuoritusPalveluClient])
  val database: JdbcDatabaseDef = Mockito.mock(classOf[JdbcDatabaseDef])

  val service = SupaService(supaClient, database)

  @Test
  def palauttaaPaatettavatOpiskeluOikeudet(): Unit = {
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            PaatettavatOpiskeluOikeudetResponse(
              paatettavatOpiskeluOikeudet = Some(
                List(
                  PaatettavaOpiskeluOikeus(
                    virtaOpiskeluOikeusId = "Tunniste",
                    organisaatioOid = "",
                    organisaatioNimi = TranslatedName(fi = "Valkoiset Lakanat Oy", sv = "", en = ""),
                    supaNimi = TranslatedName(fi = "Lakana Lisensiaatti", sv = "", en = ""),
                    virtaNimi = TranslatedName("", "", "")
                  )
                )
              ),
              virhe = None,
              viesti = None
            )
          )
        )
      )
    val oikeudet = service.haePaattyvatOpiskeluOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID)
    Assertions.assertEquals(1, oikeudet.size)
    val oikeus = oikeudet.head
    Assertions.assertEquals("Valkoiset Lakanat Oy", oikeus.organisaatioNimi.fi)
    Assertions.assertEquals("Lakana Lisensiaatti", oikeus.supaNimi.fi)
  }

  @Test
  def palauttaaTyhjanListanJosVastauksessaOnVirhe(): Unit = {
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            PaatettavatOpiskeluOikeudetResponse(
              paatettavatOpiskeluOikeudet = None,
              virhe = Some(VIRHE_HAKUTOIVEEN_PAATTELYSSA),
              viesti = Some("Virhe tapahtui")
            )
          )
        )
      )
    Assertions.assertTrue(service.haePaattyvatOpiskeluOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID).isEmpty)
  }

}
