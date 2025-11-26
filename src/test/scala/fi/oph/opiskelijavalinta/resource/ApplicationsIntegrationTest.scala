package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.objectMapper
import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.*
import fi.oph.opiskelijavalinta.model.{Aikataulu, ApplicationsEnriched, DateParam, HakemuksenTulos, OhjausparametritRaw}
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.fail
import org.mockito.Mockito
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util

class ApplicationsIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.APPLICATIONS_PATH)
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def returnsApplicationsOfUser(): Unit = {
    Mockito.reset(valintaTulosServiceClient)
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)
    Mockito.when(ohjausparametritService.getOhjausparametritForHaku("haku-oid-1")).thenReturn(Some(OhjausparametritRaw(
      PH_HKP = Some(DateParam(Some(1599657520000L))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None
    )))
    val result = mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATIONS_PATH)
        .`with`(user(oppijaUser)))
      .andExpect(status().isOk)
      .andReturn()

    val applications =  objectMapper.readValue(result.getResponse.getContentAsString, classOf[ApplicationsEnriched])
    Assertions.assertEquals(1, applications.old.length)
    Assertions.assertEquals(0, applications.current.length)
    val app = applications.old.head
    Assertions.assertEquals("hakemus-oid-1", app.oid)
    Assertions.assertEquals("haku-oid-1", app.haku.get.oid)
    Assertions.assertEquals("Leikkipuiston jatkuva haku", app.haku.get.nimi.fi)
    Assertions.assertEquals("Playground search", app.haku.get.nimi.en)
    Assertions.assertEquals("Samma på svenska", app.haku.get.nimi.sv)
    val hakukohteet = app.hakukohteet.map(a => a.get).toSeq
    Assertions.assertEquals("hakukohde-oid-1", hakukohteet.head.oid)
    Assertions.assertEquals("Liukumäen lisensiaatti", hakukohteet.head.nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Liukumäki", hakukohteet.head.jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals("hakukohde-oid-2", hakukohteet(1).oid)
    Assertions.assertEquals("Hiekkalaatikon arkeologi", hakukohteet(1).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Hiekkalaatikko", hakukohteet(1).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals(1599657520000L, app.ohjausparametrit.get.hakukierrosPaattyy.get)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ilmoittautuminenPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ehdollisetValinnatPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.opiskelijanPaikanVastaanottoPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoille)
    Mockito.verifyNoInteractions(valintaTulosServiceClient)
    Assertions.assertEquals(List.empty, app.hakemuksenTulokset)
  }

  @Test
  def returnsVTSResultsForApplications(): Unit = {
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)
    val futureTimestamp = System.currentTimeMillis() + 1000000L
    Mockito.when(ohjausparametritService.getOhjausparametritForHaku("haku-oid-1")).thenReturn(Some(OhjausparametritRaw(
      PH_HKP = Some(DateParam(Some(futureTimestamp))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None
    )))
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset("haku-oid-1", "hakemus-oid-1"))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSResponse)))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(ApiConstants.APPLICATIONS_PATH)
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val applications = objectMapper.readValue(result.getResponse.getContentAsString, classOf[ApplicationsEnriched])
    Assertions.assertEquals(1, applications.current.length)
    Assertions.assertEquals(0, applications.old.length)
    val app = applications.current.head
    Assertions.assertEquals("hakemus-oid-1", app.oid)
    Assertions.assertEquals("haku-oid-1", app.haku.get.oid)
    Assertions.assertEquals("Leikkipuiston jatkuva haku", app.haku.get.nimi.fi)
    Assertions.assertEquals("Playground search", app.haku.get.nimi.en)
    Assertions.assertEquals("Samma på svenska", app.haku.get.nimi.sv)
    val hakukohteet = app.hakukohteet.map(a => a.get).toSeq
    Assertions.assertEquals("hakukohde-oid-1", hakukohteet(0).oid)
    Assertions.assertEquals("Liukumäen lisensiaatti", hakukohteet(0).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Liukumäki", hakukohteet(0).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals("hakukohde-oid-2", hakukohteet(1).oid)
    Assertions.assertEquals("Hiekkalaatikon arkeologi", hakukohteet(1).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Hiekkalaatikko", hakukohteet(1).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    Assertions.assertEquals(None, app.ohjausparametrit.get.ilmoittautuminenPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ehdollisetValinnatPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.opiskelijanPaikanVastaanottoPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoille)
    val hakutoive1 = app.hakemuksenTulokset.headOption.getOrElse(
      fail("No hakemuksenTulokset returned")
    )
    Assertions.assertEquals("HYVAKSYTTY", hakutoive1.valintatila.get)
    Assertions.assertEquals("VASTAANOTETTAVISSA_SITOVASTI", hakutoive1.vastaanotettavuustila.get)
    Assertions.assertEquals("KESKEN", hakutoive1.vastaanottotila.get)
    Assertions.assertEquals("2025-12-12T13:00:00Z", hakutoive1.vastaanottoDeadline.get)
    val hakutoive2 = app.hakemuksenTulokset
      .find(_.hakukohdeOid.contains("hakukohde-oid-2"))
      .getOrElse(fail("hakukohde-oid-2 not found"))

    Assertions.assertEquals(Some("KESKEN"), hakutoive2.vastaanottotila)
  }

  @Test
  def doesNotReturnUnpublishedVTSResults(): Unit = {
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)
    val futureTimestamp = System.currentTimeMillis() + 1000000L
    Mockito.when(ohjausparametritService.getOhjausparametritForHaku("haku-oid-1")).thenReturn(Some(OhjausparametritRaw(
      PH_HKP = Some(DateParam(Some(futureTimestamp))),
      PH_IP = None,
      PH_VTJH = None,
      PH_EVR = None,
      PH_OPVP = None
    )))
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset("haku-oid-1", "hakemus-oid-1"))
      .thenReturn(
        Right(objectMapper.writeValueAsString(mockVTSKeskenResponse)))
    val result = mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATIONS_PATH)
        .`with`(user(oppijaUser)))
      .andExpect(status().isOk)
      .andReturn()

    val applications = objectMapper.readValue(result.getResponse.getContentAsString, classOf[ApplicationsEnriched])
    Assertions.assertEquals(1, applications.current.length)
    Assertions.assertEquals(0, applications.old.length)
    val app = applications.current.head
    Assertions.assertEquals("hakemus-oid-1", app.oid)
    Assertions.assertEquals("haku-oid-1", app.haku.get.oid)
    Assertions.assertEquals("Leikkipuiston jatkuva haku", app.haku.get.nimi.fi)
    Assertions.assertEquals("Playground search", app.haku.get.nimi.en)
    Assertions.assertEquals("Samma på svenska", app.haku.get.nimi.sv)
    val hakukohteet = app.hakukohteet.map(a => a.get).toSeq
    Assertions.assertEquals("hakukohde-oid-1", hakukohteet(0).oid)
    Assertions.assertEquals("Liukumäen lisensiaatti", hakukohteet(0).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Liukumäki", hakukohteet(0).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertEquals("hakukohde-oid-2", hakukohteet(1).oid)
    Assertions.assertEquals("Hiekkalaatikon arkeologi", hakukohteet(1).nimi.fi)
    Assertions.assertEquals("Leikkipuisto, Hiekkalaatikko", hakukohteet(1).jarjestyspaikkaHierarkiaNimi.fi)
    Assertions.assertTrue(app.ohjausparametrit.get.hakukierrosPaattyy.get > System.currentTimeMillis())
    Assertions.assertEquals(None, app.ohjausparametrit.get.ilmoittautuminenPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ehdollisetValinnatPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.opiskelijanPaikanVastaanottoPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoille)
    Assertions.assertEquals(List.empty, app.hakemuksenTulokset)
  }
}
