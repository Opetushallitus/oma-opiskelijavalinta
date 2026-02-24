package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{linkUser, oppijaUser, HAKEMUS_OID, PERSON_OID}
import fi.oph.opiskelijavalinta.clients.AtaruClient
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import fi.oph.opiskelijavalinta.security.OppijaUser
import org.mockito.Mockito
import org.junit.jupiter.api.*
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito.{times, when}
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithUserDetails

class AuthorizationServiceTest {

  val hakemuksetService: HakemuksetService = Mockito.mock(classOf[HakemuksetService])
  val service: AuthorizationService        = AuthorizationService(hakemuksetService)

  @Test
  def linkatullaKayttajallaEiOleOikeuttaVaaraanHakemukseen(): Unit = {
    setup(linkUser)
    Assertions.assertFalse(service.hasAuthAccessToHakemus("vaara-hakemus-oid"))
    Mockito.verifyNoInteractions(hakemuksetService)
  }

  @Test
  def linkatullaKayttajallaOnOikeusHakemukseen(): Unit = {
    setup(linkUser)
    Assertions.assertTrue(service.hasAuthAccessToHakemus(HAKEMUS_OID))
    Mockito.verifyNoInteractions(hakemuksetService)
  }

  @Test
  def tavallisellaKayttajallaEiOleOikeuttaVaaraanHakemukseen(): Unit = {
    setup(oppijaUser)
    Mockito.when(hakemuksetService.getHakemusOids(PERSON_OID)).thenReturn(List("vaara-hakemus-oid"))
    Assertions.assertFalse(service.hasAuthAccessToHakemus(HAKEMUS_OID))
    Mockito.verify(hakemuksetService, times(1)).getHakemusOids(PERSON_OID)
  }

  @Test
  def tavallisellaKayttajallaOnOikeusHakemukseen(): Unit = {
    setup(oppijaUser)
    Mockito.when(hakemuksetService.getHakemusOids(PERSON_OID)).thenReturn(List(HAKEMUS_OID))
    Assertions.assertTrue(service.hasAuthAccessToHakemus(HAKEMUS_OID))
    Mockito.verify(hakemuksetService, times(1)).getHakemusOids(PERSON_OID)
  }

  private def setup(user: OppijaUser): Unit = {
    val auth = Mockito.mock(classOf[Authentication])
    when(auth.getAuthorities).thenReturn(user.getAuthorities)
    when(auth.getPrincipal).thenReturn(user)
    when(auth.isAuthenticated).thenReturn(true)
    SecurityContextHolder.getContext.setAuthentication(auth)
  }

}
