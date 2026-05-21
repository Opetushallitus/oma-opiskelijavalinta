package fi.oph.opiskelijavalinta.service

import com.fasterxml.jackson.annotation.{JsonSetter, Nulls}
import com.fasterxml.jackson.databind.{DeserializationFeature, ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import fi.oph.opiskelijavalinta.clients.SuoritusPalveluClient
import fi.oph.opiskelijavalinta.model.{PaatettavaOpiskeluOikeus, PaatettavatOpiskeluOikeudetResponse, YosVirhe}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.web.context.request.RequestContextHolder
import slick.jdbc.JdbcBackend.JdbcDatabaseDef
import slick.jdbc.PostgresProfile.api.*

import java.util.concurrent.TimeUnit
import scala.concurrent.Await
import scala.concurrent.duration.Duration

@Service
class SupaService @Autowired (supaClient: SuoritusPalveluClient, database: JdbcDatabaseDef, mapper: ObjectMapper = new ObjectMapper()) {

  private val LOG: Logger = LoggerFactory.getLogger(classOf[SupaService]);

  mapper.registerModule(DefaultScalaModule)
  mapper.registerModule(new JavaTimeModule())
  mapper.registerModule(new Jdk8Module())
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
  mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false)
  mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
  mapper
    .configOverride(classOf[List[_]])
    .setSetterInfo(JsonSetter.Value.forValueNulls(Nulls.AS_EMPTY))

  def haePaattyvatOpiskeluOikeudet(
    hakijaOid: String,
    hakuOid: String,
    hakukohdeOid: String
  ): List[PaatettavaOpiskeluOikeus] = {
    LOG.info(s"Haetaan päättyvät opiskeluoikeudet hakijalle $hakijaOid, haulle $hakuOid, hakukohteelle $hakukohdeOid")
    supaClient.getPaattyvatOpintoOikeudet(hakijaOid, hakuOid, hakukohdeOid) match {
      case Left(e) =>
        LOG.error(
          s"Virhe päättyvien opiskeluoikeuksien hakemisessa, hakijaOid=$hakijaOid, hakuOid=$hakuOid, hakukohdeOid=$hakukohdeOid: ${e.getMessage}"
        )
        List.empty
      case Right(o) =>
        try {
          val raw = mapper.readValue(o, classOf[PaatettavatOpiskeluOikeudetResponse])
          raw match {
            case PaatettavatOpiskeluOikeudetResponse(_, Some(virhe), Some(viesti)) =>
              handleYosVirhe(virhe, viesti)
              List.empty
            case PaatettavatOpiskeluOikeudetResponse(Some(paatettavatOpiskeluOikeudet), _, _) =>
              saveOpiskeluOikeudetToSession(hakukohdeOid, raw)
              paatettavatOpiskeluOikeudet
            case PaatettavatOpiskeluOikeudetResponse(_, _, _) =>
              LOG.error(s"Opiskeluoikeuden päättelysta on palautunut vääränlainen vastaus, $raw")
              List.empty
          }
        } catch {
          case e: Exception =>
            LOG.error(
              "Päättyvien opiskeluoikeuksien deserialisointi epäonnistui hakijalle $hakijaOid, haulle $hakuOid, hakukohteelle $hakukohdeOid",
              e
            )
            List.empty
        }
    }
  }

  def fetchOpiskeluOikeudetFromSession(hakukohdeOid: String): Option[List[PaatettavaOpiskeluOikeus]] = {
    val sessionId = RequestContextHolder.currentRequestAttributes().getSessionId
    val oikeudet = Await.result(database.run(
      sql"""SELECT PAATETTAVAT_OIKEUDET FROM PAATETTAVAT_OPISKELUOIKEUDET
            WHERE HAKUKOHDE_OID = '$hakukohdeOid' AND SESSION_ID = '$sessionId'
        )""".as[String]), Duration(10, TimeUnit.SECONDS))
    if (oikeudet.isEmpty) {
      LOG.info(s"Päätettäviä oikeuksia ei löytynyt hakutoiveelle $hakukohdeOid ja sessiolle $sessionId")
      None
    } else {
      mapper.readValue(oikeudet.head, classOf[PaatettavatOpiskeluOikeudetResponse]).paatettavatOpiskeluOikeudet
    }
  }

  private def handleYosVirhe(virhe: YosVirhe, viesti: String): Unit = {
    // TODO: OPHYOS-170, mihin tämän virheen pitäisi vaikuttaa? Näytetäänkö käyttäjälle?
    virhe match {
      case YosVirhe.VIRHE_HAKUTOIVEEN_PAATTELYSSA =>
        LOG.error(s"Virhe tapahtunut päätellessä kuuluuko hakutoive YOS piiriin, virhe $virhe, viesti $viesti")
      case YosVirhe.VIRHE_PAATETTAVIEN_OPISKELUOIKEUKSIEN_HAUSSA =>
        LOG.error(s"Virhe tapahtunut hakiessa päätettäviä opiskeluoikeuksia, virhe $virhe, viesti $viesti")
      case _ =>
        LOG.error(s"Virhe tapahtunut rajapinta kutsussa, virhe $virhe, viesti $viesti")
      // TODO OPHYOS-170: pitäisikö tässä lentää poikkeus?
    }
  }

  private def saveOpiskeluOikeudetToSession(hakukohdeOid: String, oikeudet: PaatettavatOpiskeluOikeudetResponse): Unit = {
    val oikeudetJson: String = mapper.writeValueAsString(oikeudet)
    val attributes = RequestContextHolder.currentRequestAttributes()
    val sessionId = RequestContextHolder.currentRequestAttributes().getSessionId
    Await.result(database.run(
      sql"""INSERT INTO PAATETTAVAT_OPISKELUOIKEUDET(SESSION_ID, HAKUKOHDE_OID, PAATETTAVAT_OIKEUDET)
      VALUES(
        ${sessionId},
        $hakukohdeOid,
        $oikeudetJson::json
      )""".as[String]), Duration(5, TimeUnit.SECONDS))
  }
}
