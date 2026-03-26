package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.clients.OnrClient
import fi.oph.viestinvalitys.ViestinvalitysClient
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.TestInstance.Lifecycle
import org.mockito.Mockito

@TestInstance(Lifecycle.PER_METHOD)
class ViestiServiceTest {

  val koutaService: KoutaService                 = Mockito.mock(classOf[KoutaService])
  val hakemuksetService: HakemuksetService       = Mockito.mock(classOf[HakemuksetService])
  val lokalisointiService: LokalisointiService   = Mockito.mock(classOf[LokalisointiService])
  val onrClient: OnrClient                       = Mockito.mock(classOf[OnrClient])
  val viestinvalitysClient: ViestinvalitysClient = Mockito.mock(classOf[ViestinvalitysClient])
  val authorizationService: AuthorizationService = Mockito.mock(classOf[AuthorizationService])
  val viestiService: ViestiService               =
    ViestiService(
      hakemuksetService,
      koutaService,
      lokalisointiService,
      onrClient,
      authorizationService,
      viestinvalitysClient
    )

  // kutsuu viestiClientia oikeilla parametreilla
  // palauttaa virheen
}
