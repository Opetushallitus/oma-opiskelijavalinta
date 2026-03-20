package fi.oph.opiskelijavalinta.resource

import fi.oph.opiskelijavalinta.BaseIntegrationTest
import fi.oph.opiskelijavalinta.TestUtils.{
  objectMapper,
  oppijaUser,
  HAKEMUS_OID,
  HAKUKOHDE_OID,
  HAKUKOHDE_OID_2,
  HAKU_OID,
  PERSON_OID
}
import fi.oph.opiskelijavalinta.mockdata.KoutaMockData.{hakukohde1, hakukohde2, kaynnissaOlevaHaku}
import fi.oph.opiskelijavalinta.model.{Hakemus, TranslatedName}
import fi.oph.opiskelijavalinta.security.AuditOperation
import fi.oph.viestinvalitys.vastaanotto.resource.LuoViestiSuccessResponseImpl
import org.junit.jupiter.api.*
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

import java.util.UUID

class VastaanottoIntegrationTest extends BaseIntegrationTest {

  @Test
  def get401ResponseFromUnauthenticatedUser(): Unit = {
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .content("VastaanotaSitovasti")
      )
      .andExpect(status().isUnauthorized)
  }

  @Test
  def get403ResponseFromUnauthorizedUserWithoutHakemus(): Unit = {
    val vastaanottoDTO = VastaanottoDTO(
      "VastaanotaSitovasti",
      "haku-oid-1",
      "vastaanotto.vaihtoehdot.sitova"
    )
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(Right(objectMapper.writeValueAsString(Array.empty[Hakemus])))
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(vastaanottoDTO))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def get403ResponseFromUnauthorizedUserTryingToAccessWrongHakemus(): Unit = {
    val vastaanottoDTO = VastaanottoDTO(
      "VastaanotaSitovasti",
      "haku-oid-1",
      "vastaanotto.vaihtoehdot.sitova"
    )
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                "HAKEMUS-OID-3",
                "haku-oid-1",
                List("hakukohde-oid-1", "hakukohde-oid-2"),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                None,
                None,
                None,
                None
              )
            )
          )
        )
      )
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(vastaanottoDTO))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isForbidden)
  }

  @Test
  def doesVastaanotto(): Unit = {
    val vastaanottoDTO = VastaanottoDTO(
      "VastaanotaSitovasti",
      HAKU_OID,
      "vastaanotto.vaihtoehdot.sitova"
    )
    initProperVastaanotto()
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(vastaanottoDTO))
          .`with`(user(oppijaUser))
      )
      .andExpect(status().isOk)
  }

  @Test
  def auditLogsVastaanotto(): Unit = {
    val vastaanottoDTO = VastaanottoDTO(
      "VastaanotaSitovasti",
      HAKU_OID,
      "vastaanotto.vaihtoehdot.sitova"
    )
    initProperVastaanotto()
    mvc
      .perform(
        MockMvcRequestBuilders
          .post(s"${ApiConstants.VASTAANOTTO_PATH}/hakemus/$HAKEMUS_OID/hakukohde/$HAKUKOHDE_OID")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(vastaanottoDTO))
          .`with`(user(oppijaUser))
      )
    val auditLogEntries = getAllAuditLogEntries
    Assertions.assertEquals(2, auditLogEntries.size)
    val auditLogEntry = auditLogEntries.head
    Assertions.assertEquals(AuditOperation.TallennaVastaanotto.name, auditLogEntry.operation)
    Assertions.assertEquals(
      Map(
        "hakemusOid"   -> HAKEMUS_OID,
        "hakukohdeOid" -> HAKUKOHDE_OID
      ),
      auditLogEntry.target
    )
    Assertions.assertTrue(auditLogEntry.changes.contains("VastaanotaSitovasti"))
    val auditLogEntryEmail = auditLogEntries.last
    Assertions.assertEquals(AuditOperation.LahetaVastaanottoviesti.name, auditLogEntryEmail.operation)
    Assertions.assertEquals(
      Map(
        "hakemusOid"   -> HAKEMUS_OID,
        "hakukohdeOid" -> HAKUKOHDE_OID
      ),
      auditLogEntryEmail.target
    )
    Assertions.assertEquals(List.empty, auditLogEntryEmail.changes)
  }

  def initProperVastaanotto(): Unit = {
    Mockito
      .when(ataruClient.getHakemukset(PERSON_OID))
      .thenReturn(
        Right(
          objectMapper.writeValueAsString(
            Array(
              Hakemus(
                HAKEMUS_OID,
                HAKU_OID,
                List(HAKUKOHDE_OID, HAKUKOHDE_OID_2),
                "secret1",
                "2025-11-19T09:32:01.886Z",
                false,
                TranslatedName("Leikkilomake", "Samma på svenska", "Playform"),
                None,
                None,
                Some("testi.kayttaja@example.org"),
                Some("fi")
              )
            )
          )
        )
      )
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
      .when(valintaTulosServiceClient.postVastaanotto(HAKEMUS_OID, HAKUKOHDE_OID, "VastaanotaSitovasti"))
      .thenReturn(Right("OK"))
    Mockito
      .when(viestinvalitysClient.luoViesti(any()))
      .thenReturn(
        LuoViestiSuccessResponseImpl(
          UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
          UUID.fromString("5b4501ec-3298-4064-8868-262b55fdce9a")
        )
      )
    None
  }
}
