package fi.oph.opiskelijavalinta

import fi.oph.opiskelijavalinta.configuration.OppijaUser
import fi.oph.opiskelijavalinta.model.ApplicationEnriched
import fi.oph.opiskelijavalinta.resource.ApiConstants
import org.junit.jupiter.api.*
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util

class ApplicationsIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATIONS_PATH))
      .andExpect(status().isUnauthorized)
  }

  @Test
  def returnsApplicationsOfUser(): Unit = {
    val attributes = Map("personOid" -> "someValue")
    val authorities = util.ArrayList[SimpleGrantedAuthority]
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
    val oppijaUser = new OppijaUser(attributes, "testuser", authorities)

    val result = mvc.perform(MockMvcRequestBuilders
        .get(ApiConstants.APPLICATIONS_PATH)
        .`with`(user(oppijaUser)))
      .andExpect(status().isOk)
      .andReturn()

    val applications =  objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[ApplicationEnriched]])
    Assertions.assertEquals(1, applications.length)
    val app = applications(0)
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
    Assertions.assertEquals(1799657520000L, app.ohjausparametrit.get.hakukierrosPaattyy.get)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ilmoittautuminenPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.ehdollisetValinnatPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.opiskelijanPaikanVastaanottoPaattyy)
    Assertions.assertEquals(None, app.ohjausparametrit.get.valintaTuloksetJulkaistaanHakijoille)
  }
}
