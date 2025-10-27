package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.session.{HttpSessionAdapter, OphSessionMappingStorage}
import jakarta.servlet.http.HttpSession
import org.slf4j.LoggerFactory
import org.springframework.session.{Session, SessionRepository}
import slick.jdbc.PostgresProfile.api.*

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, ExecutionContext}

class JdbcSessionMappingStorage(sessionRepository: SessionRepository[Session],
                                db: Database)(implicit ec: ExecutionContext) extends OphSessionMappingStorage {

  val LOG = LoggerFactory.getLogger(classOf[JdbcSessionMappingStorage])

  val sessionTableName = s"SPRING_SESSION"
  val mappingTableName = s"CAS_SESSION_MAPPING"
  @Override
  def removeSessionByMappingId(mappingId: String): HttpSession = {
    LOG.debug(s"Poistetaan sessiomappaus cas tiketillä $mappingId")
    val query = sql"""SELECT session_id FROM #$mappingTableName WHERE mapped_ticket_id = $mappingId""".as[String].headOption
    val sessionIdOpt = Await.result(db.run(query), Duration(10, TimeUnit.SECONDS))

    sessionIdOpt
      .flatMap(sessionId => Option(sessionRepository.findById(sessionId)))
      .map(s => new HttpSessionAdapter(sessionRepository, s))
      .orNull
  }

  @Override
  def removeBySessionById(sessionId: String): Unit = {
    LOG.debug(s"Poistetaan sessiomappaus session id:llä $sessionId")
    val sql = sqlu"""DELETE FROM #$mappingTableName WHERE session_id = $sessionId"""
    Await.result(db.run(sql), Duration(10, TimeUnit.SECONDS))
  }

  @Override
  def addSessionById(mappingId: String, session: HttpSession): Unit = {
    LOG.debug(s"Lisätään sessiomappaus, mappingId: $mappingId, sessionId: ${session.getId}")
    val sql = sqlu"""INSERT INTO #$mappingTableName (mapped_ticket_id, session_id) VALUES ($mappingId, ${session.getId}) ON CONFLICT (mapped_ticket_id) DO NOTHING"""
    Await.result(db.run(sql), Duration(10, TimeUnit.SECONDS))
  }

  @Override
  def clean(): Unit = {
    LOG.debug("Siivotaan sessiomappaukset joille ei löydy sessiota")
    val sql = sqlu"""DELETE FROM #$mappingTableName WHERE session_id NOT IN (SELECT session_id FROM #$sessionTableName)"""
    Await.result(db.run(sql), Duration(10, TimeUnit.SECONDS))
  }

}

