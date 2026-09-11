package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{objectMapper, userWithoutPersonOid, PERSON_OID}
import fi.oph.opiskelijavalinta.clients.model.Oppija
import fi.oph.opiskelijavalinta.security.OppijaUser
import org.junit.jupiter.api.*
import org.mockito.Mockito
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.{content, status}

import java.util

class UserResourceIntegrationTest extends BaseIntegrationTest {

  private val HETU = "010190-123A"

  @BeforeEach
  def resetMocks(): Unit =
    Mockito.reset(onrService)

  private def authorities: util.ArrayList[SimpleGrantedAuthority] =
    val list = new util.ArrayList[SimpleGrantedAuthority]
    list.add(new SimpleGrantedAuthority("ROLE_USER"))
    list

  private def userWithPersonOid: OppijaUser =
    new OppijaUser(
      Map("personOid" -> PERSON_OID),
      personOid = Some(PERSON_OID),
      username = "oppija",
      authorities = authorities
    )

  private def userWithHetu: OppijaUser =
    new OppijaUser(
      Map.empty[String, String],
      hetu = Some(HETU),
      username = "hetu-oppija",
      authorities = authorities
    )

  private def userWithoutPersonOidJaHetuaMuttaNimitiedoilla: OppijaUser =
    new OppijaUser(
      Map("firstName" -> "Etu", "familyName" -> "Suku", "dateOfBirth" -> "1990-05-17"),
      username = "eidas-oppija",
      authorities = authorities
    )

  private def userWithPersonOidJaNimitiedoilla: OppijaUser =
    new OppijaUser(
      Map("personOid" -> PERSON_OID, "firstName" -> "Etu", "familyName" -> "Suku", "dateOfBirth" -> "1990-05-17"),
      personOid = Some(PERSON_OID),
      username = "oppija",
      authorities = authorities
    )

  private def userWithHetuJaNimitiedoilla: OppijaUser =
    new OppijaUser(
      Map("displayName" -> "Etu Suku"),
      hetu = Some(HETU),
      username = "hetu-oppija",
      authorities = authorities
    )

  @Test
  def palauttaa200JaOppijanKunOnrLoytaaTiedot(): Unit = {
    val oppija = Oppija(PERSON_OID, "2020-01-01", "Testi", "Testinen")
    Mockito.when(onrService.getPersonInfo(PERSON_OID)).thenReturn(Some(oppija))

    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithPersonOid))
      )
      .andExpect(status().isOk)
      .andReturn()

    Assertions.assertEquals(
      oppija,
      objectMapper.readValue(result.getResponse.getContentAsString, classOf[Oppija])
    )
  }

  @Test
  def palauttaa204KunOnrEiLoydaOppijaaOppijanumerolla(): Unit = {
    Mockito.when(onrService.getPersonInfo(PERSON_OID)).thenReturn(None)

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithPersonOid))
      )
      .andExpect(status().isNoContent)
      .andExpect(content().string(""))
  }

  @Test
  def palauttaa204KunOnrEiLoydaOppijaaHetulla(): Unit = {
    Mockito.when(onrService.getPersonInfoByHetu(HETU)).thenReturn(None)

    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithHetu))
      )
      .andExpect(status().isNoContent)
      .andExpect(content().string(""))
  }

  @Test
  def palauttaa204KunKayttajallaEiOleOppijanumeroaEikaHetua(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithoutPersonOid))
      )
      .andExpect(status().isNoContent)

    Mockito.verifyNoInteractions(onrService)
  }

  @Test
  def palauttaa200JaNimitiedotAttribuuteistaKunKayttajallaEiOleOppijanumeroaEikaHetua(): Unit = {
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithoutPersonOidJaHetuaMuttaNimitiedoilla))
      )
      .andExpect(status().isOk)
      .andReturn()

    Assertions.assertEquals(
      Oppija(oppijanumero = "", syntymaaika = "1990-05-17", kutsumanimi = "Etu", sukunimi = "Suku"),
      objectMapper.readValue(result.getResponse.getContentAsString, classOf[Oppija])
    )
    Mockito.verifyNoInteractions(onrService)
  }

  @Test
  def palauttaa200JaNimitiedotAttribuuteistaKunOnrEiLoydaOppijaaOppijanumerolla(): Unit = {
    Mockito.when(onrService.getPersonInfo(PERSON_OID)).thenReturn(None)

    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithPersonOidJaNimitiedoilla))
      )
      .andExpect(status().isOk)
      .andReturn()

    Assertions.assertEquals(
      Oppija(oppijanumero = "", syntymaaika = "1990-05-17", kutsumanimi = "Etu", sukunimi = "Suku"),
      objectMapper.readValue(result.getResponse.getContentAsString, classOf[Oppija])
    )
  }

  @Test
  def palauttaa200JaKokoNimenAttribuuteistaKunOnrEiLoydaOppijaaHetulla(): Unit = {
    Mockito.when(onrService.getPersonInfoByHetu(HETU)).thenReturn(None)

    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.USER_PATH)
          .`with`(user(userWithHetuJaNimitiedoilla))
      )
      .andExpect(status().isOk)
      .andReturn()

    Assertions.assertEquals(
      Oppija(oppijanumero = "", syntymaaika = "", kutsumanimi = "Etu Suku", sukunimi = ""),
      objectMapper.readValue(result.getResponse.getContentAsString, classOf[Oppija])
    )
  }
}
