package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{linkUser, objectMapper, oppijaUser, HAKEMUS_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.model.{HakemusmaksunMaksupaiva, Haku, Hakuaika, TranslatedName}
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class HakemusmaksuIntegrationTest extends BaseIntegrationTest {

  private val SYKSY_2027_HAKU_OID   = "1.2.246.562.29.00000000000000099001"
  private val SYKSY_2027_HAKU_2_OID = "1.2.246.562.29.00000000000000099002"
  private val KEVAT_2028_HAKU_OID   = "1.2.246.562.29.00000000000000099003"

  private val MAKSANUT_HAKEMUS_OID      = "1.2.246.562.11.00000000000002129001"
  private val TOISEN_KAUDEN_HAKEMUS_OID = "1.2.246.562.11.00000000000002129002"
  private val MAKSUPAIVA_PATH           = s"${ApiConstants.HAKEMUSMAKSU_PATH}/hakemus/$HAKEMUS_OID/maksupaiva"

  @BeforeEach
  def init(): Unit = {
    evictAllCaches()
    Mockito.reset(ataruClient)
    mockHaku(SYKSY_2027_HAKU_OID, "kausi_s#1", "2027")
    mockHaku(SYKSY_2027_HAKU_2_OID, "kausi_s#1", "2027")
    mockHaku(KEVAT_2028_HAKU_OID, "kausi_k#1", "2028")
  }

  private def mockHaku(hakuOid: String, kausi: String, vuosi: String): Unit =
    Mockito
      .when(koutaClient.getHaku(hakuOid))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Haku(
              hakuOid,
              TranslatedName("Korkeakoulujen yhteishaku", "", ""),
              "hakutapa_01",
              "haunkohdejoukko_12",
              Seq(Hakuaika("2026-08-01T00:00:00", "2026-09-01T00:00:00")),
              Some(kausi),
              Some(vuosi),
              None
            )
          )
        )
      )

  // Hakemuspalvelu palauttaa maksutilan muodossa "ok-by-proxy", joten hakemukset kirjoitetaan sen JSON-muodossa
  private def hakemus(oid: String, hakuOid: String, maksutila: String): Map[String, Any] =
    Map(
      "oid"          -> oid,
      "haku"         -> hakuOid,
      "hakukohteet"  -> List.empty,
      "secret"       -> "secret",
      "submitted"    -> "2026-08-15T09:32:01.886Z",
      "processing"   -> false,
      "paymentState" -> maksutila,
      "formName"     -> Map("fi" -> "Lomake", "sv" -> "", "en" -> "")
    )

  private def mockHakemukset(hakemukset: Map[String, Any]*): Unit =
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakemukset)))

  private def mockLaskut(hakemusOid: String, laskut: Map[String, Any]*): Unit =
    Mockito
      .when(maksutClient.getLaskut(hakemusOid))
      .thenReturn(Right(objectMapper.writeValueAsString(laskut)))

  private def lasku(hakemusOid: String, status: String, paidAt: String, origin: String = "kkhakemusmaksu") =
    Map(
      "order_id"   -> "KKHA2129001",
      "reference"  -> hakemusOid,
      "status"     -> status,
      "origin"     -> origin,
      "due_date"   -> "2026-09-01",
      "amount"     -> "100.00",
      "paid_at"    -> paidAt,
      "first_name" -> "Testi",
      "last_name"  -> "Hakija"
    )

  private def getMaksupaiva(): HakemusmaksunMaksupaiva = {
    val result = mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(oppijaUser)))
      .andExpect(status().isOk)
      .andReturn()
    objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemusmaksunMaksupaiva])
  }

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH))
      .andExpect(status().isUnauthorized)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def get403ResponseWhenApplicationIsNotUsers(): Unit = {
    mockHakemukset(hakemus(MAKSANUT_HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(oppijaUser)))
      .andExpect(status().isForbidden)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def get403ResponseWhenLinkUserRequestsAnotherApplication(): Unit = {
    mockHakemukset(
      hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"),
      hakemus(MAKSANUT_HAKEMUS_OID, SYKSY_2027_HAKU_2_OID, "paid")
    )
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.HAKEMUSMAKSU_PATH}/hakemus/$MAKSANUT_HAKEMUS_OID/maksupaiva")
          .`with`(user(linkUser))
      )
      .andExpect(status().isForbidden)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def returnsPaymentDateOfPaidApplication(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mockLaskut(
      HAKEMUS_OID,
      lasku(HAKEMUS_OID, "paid", "2026-08-20"),
      lasku(HAKEMUS_OID, "paid", "2026-08-19", origin = "tutu")
    )
    Assertions.assertEquals(Some("2026-08-20"), getMaksupaiva().maksupaiva)
  }

  @Test
  def returnsPaymentDateOfPaidApplicationForLinkUser(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mockLaskut(HAKEMUS_OID, lasku(HAKEMUS_OID, "paid", "2026-08-20"))
    val result = mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(linkUser)))
      .andExpect(status().isOk)
      .andReturn()
    val maksupaiva = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemusmaksunMaksupaiva])
    Assertions.assertEquals(Some("2026-08-20"), maksupaiva.maksupaiva)
  }

  @Test
  def returnsPaymentDateOfPayingApplicationOfSameStartTermForOkByProxy(): Unit = {
    mockHakemukset(
      hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "ok-by-proxy"),
      hakemus(MAKSANUT_HAKEMUS_OID, SYKSY_2027_HAKU_2_OID, "paid"),
      hakemus(TOISEN_KAUDEN_HAKEMUS_OID, KEVAT_2028_HAKU_OID, "paid")
    )
    mockLaskut(MAKSANUT_HAKEMUS_OID, lasku(MAKSANUT_HAKEMUS_OID, "paid", "2026-08-03"))
    Assertions.assertEquals(Some("2026-08-03"), getMaksupaiva().maksupaiva)
    Mockito.verify(maksutClient, Mockito.never()).getLaskut(TOISEN_KAUDEN_HAKEMUS_OID)
    Mockito.verify(maksutClient, Mockito.never()).getLaskut(HAKEMUS_OID)
  }

  @Test
  def returnsNoPaymentDateForOkByProxyWithoutPayingApplication(): Unit = {
    mockHakemukset(
      hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "ok-by-proxy"),
      hakemus(TOISEN_KAUDEN_HAKEMUS_OID, KEVAT_2028_HAKU_OID, "paid")
    )
    Assertions.assertEquals(None, getMaksupaiva().maksupaiva)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def returnsNoPaymentDateWhenPaymentIsNotPaid(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "awaiting"))
    Assertions.assertEquals(None, getMaksupaiva().maksupaiva)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def returnsNoPaymentDateWhenInvoiceIsNotPaid(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mockLaskut(HAKEMUS_OID, lasku(HAKEMUS_OID, "active", ""))
    Assertions.assertEquals(None, getMaksupaiva().maksupaiva)
  }

  @Test
  def get500ResponseWhenMaksutFails(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    Mockito.when(maksutClient.getLaskut(anyString())).thenReturn(Left(RuntimeException("maksut ei vastaa")))
    mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(oppijaUser)))
      .andExpect(status().isInternalServerError)
  }

  @Test
  def returnsEarliestPaymentDateWhenSeveralInvoicesArePaid(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mockLaskut(
      HAKEMUS_OID,
      lasku(HAKEMUS_OID, "paid", "2026-08-22"),
      lasku(HAKEMUS_OID, "paid", "2026-08-20"),
      lasku(HAKEMUS_OID, "invalidated", "")
    )
    Assertions.assertEquals(Some("2026-08-20"), getMaksupaiva().maksupaiva)
  }

  @Test
  def returnsDatePartWhenPaymentTimeContainsTimeOfDay(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    mockLaskut(HAKEMUS_OID, lasku(HAKEMUS_OID, "paid", "2026-08-20T23:15:00"))
    Assertions.assertEquals(Some("2026-08-20"), getMaksupaiva().maksupaiva)
  }

  @Test
  def returnsPaymentDateOfPayingApplicationForLinkUserWithOkByProxy(): Unit = {
    mockHakemukset(
      hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "ok-by-proxy"),
      hakemus(MAKSANUT_HAKEMUS_OID, SYKSY_2027_HAKU_2_OID, "paid")
    )
    mockLaskut(MAKSANUT_HAKEMUS_OID, lasku(MAKSANUT_HAKEMUS_OID, "paid", "2026-08-03"))
    val result = mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(linkUser)))
      .andExpect(status().isOk)
      .andReturn()
    val maksupaiva = objectMapper.readValue(result.getResponse.getContentAsString, classOf[HakemusmaksunMaksupaiva])
    Assertions.assertEquals(Some("2026-08-03"), maksupaiva.maksupaiva)
  }

  @Test
  def returnsNoPaymentDateForOkByProxyWhenHakuCannotBeFetched(): Unit = {
    mockHakemukset(
      hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "ok-by-proxy"),
      hakemus(MAKSANUT_HAKEMUS_OID, SYKSY_2027_HAKU_2_OID, "paid")
    )
    Mockito.when(koutaClient.getHaku(SYKSY_2027_HAKU_OID)).thenReturn(Left(RuntimeException("kouta ei vastaa")))
    Assertions.assertEquals(None, getMaksupaiva().maksupaiva)
    Mockito.verifyNoInteractions(maksutClient)
  }

  @Test
  def get500ResponseWhenMaksutReturnsInvalidJson(): Unit = {
    mockHakemukset(hakemus(HAKEMUS_OID, SYKSY_2027_HAKU_OID, "paid"))
    Mockito.when(maksutClient.getLaskut(HAKEMUS_OID)).thenReturn(Right("<html>virhe</html>"))
    mvc
      .perform(MockMvcRequestBuilders.get(MAKSUPAIVA_PATH).`with`(user(oppijaUser)))
      .andExpect(status().isInternalServerError)
  }
}
