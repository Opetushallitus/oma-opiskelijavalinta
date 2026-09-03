package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{
  linkUser,
  objectMapper,
  oppijaUser,
  HAKEMUS_OID,
  HAKUKOHDE_OID,
  HAKUKOHDE_OID_2,
  HAKU_OID,
  MASTER_OID,
  PERSON_OID
}
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.{hakukohde1, hakukohde2, kaynnissaOlevaHaku}
import fi.oph.opiskelijavalinta.mockdata.VTSMockData.{
  hakutoive1Hyvaksytty,
  hakutoive2Kesken,
  mockVTSKeskenResponse,
  mockVTSResponse
}
import fi.oph.opiskelijavalinta.model.{
  HakemuksenTulos,
  Hakemus,
  HakutoiveenTulos,
  HakutoiveenTulosEnriched,
  PaatettavatOpiskeluOikeudetResponse
}
import fi.oph.opiskelijavalinta.security.{MigriJWT, MigriJsonWebToken}
import org.junit.jupiter.api.*
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import pdi.jwt.{Jwt, JwtAlgorithm}

class ValintaTulosIntegrationTest @Autowired() extends BaseIntegrationTest {

  @Autowired
  private var migriToken: MigriJsonWebToken = _

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def get403ResponseFromUnauthorizedUser(): Unit = {
    val hakemusNotFoundOid = "1.2.246.562.11.00000000000002121551"
    Mockito
      .when(ataruClient.getHakemukset(hakemusNotFoundOid))
      .thenReturn(Right(objectMapper.writeValueAsString(Array.empty[Hakemus])))
    mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$hakemusNotFoundOid/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def returnsOnlyPublishedResults(): Unit = {
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(kaynnissaOlevaHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSResponse)))
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            PaatettavatOpiskeluOikeudetResponse(
              paatettavatOpiskeluOikeudet = Option(List()),
              virhe = None,
              viesti = None
            )
          )
        )
      )
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()
    val tulokset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[HakutoiveenTulos]]).toSeq
    Assertions.assertEquals(2, tulokset.length)
    Assertions.assertEquals(HAKUKOHDE_OID, tulokset.head.hakukohdeOid.get)
  }

  @Test
  def returnsKeskenResultsEvenWhenTheyAreNotPublished(): Unit = {
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(mockVTSKeskenResponse)))
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
      .andReturn()
    val tulokset = objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[HakutoiveenTulos]]).toSeq
    Assertions.assertEquals(2, tulokset.size)
  }

  @Test
  def returnsMigriJwtWithMasterOidForLinkUser(): Unit = {
    Mockito
      .when(koutaClient.getHaku(HAKU_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(kaynnissaOlevaHaku)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde1)))
    Mockito
      .when(koutaClient.getHakukohde(HAKUKOHDE_OID_2))
      .thenReturn(Right(objectMapper.writeValueAsString(hakukohde2)))
    Mockito
      .when(valintaTulosServiceClient.getValinnanTulokset(HAKU_OID, HAKEMUS_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            HakemuksenTulos(
              hakuOid = Some(HAKU_OID),
              hakemusOid = Some(HAKEMUS_OID),
              hakijaOid = Some(PERSON_OID),
              hakutoiveet = List(hakutoive1Hyvaksytty.copy(showMigriURL = Some(true)), hakutoive2Kesken)
            )
          )
        )
      )
    Mockito
      .when(supaClient.getPaattyvatOpintoOikeudet(PERSON_OID, HAKU_OID, HAKUKOHDE_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            PaatettavatOpiskeluOikeudetResponse(
              paatettavatOpiskeluOikeudet = Option(List()),
              virhe = None,
              viesti = None
            )
          )
        )
      )
    val result = mvc
      .perform(
        MockMvcRequestBuilders
          .get(s"${ApiConstants.VALINTATULOS_PATH}/hakemus/$HAKEMUS_OID/haku/$HAKU_OID")
          .`with`(user(linkUser))
      )
      .andExpect(status().isOk)
      .andReturn()

    val tulokset =
      objectMapper.readValue(result.getResponse.getContentAsString, classOf[Array[HakutoiveenTulosEnriched]]).toSeq
    val hakutoive = tulokset.head

    val migriUrl = hakutoive.migriURL.get
    val jwt      = migriUrl.split("\\?token=").last

    val payload = Jwt
      .decode(jwt, migriToken.secret, Seq(JwtAlgorithm.HS256))
      .get

    val decoded = objectMapper.readValue(
      payload.content,
      classOf[MigriJWT]
    )

    Assertions.assertEquals(MASTER_OID, decoded.hakijaOid)
    Assertions.assertTrue(decoded.expires > System.currentTimeMillis())
  }
}
