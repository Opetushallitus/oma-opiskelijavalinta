package fi.oph.opiskelijavalinta.configuration

import fi.oph.opiskelijavalinta.session.JdbcSessionMappingStorage
import org.apereo.cas.client.session.SessionMappingStorage
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.session.{Session, SessionRepository}
import org.springframework.session.jdbc.JdbcIndexedSessionRepository
import slick.jdbc.PostgresProfile.api.Database

import scala.concurrent.ExecutionContext

@Configuration
class SessionMappingStorageConfiguration @Autowired() (
  private val sessionRepository: JdbcIndexedSessionRepository,
  private val db: Database
)(implicit ec: ExecutionContext) {
  val LOG = LoggerFactory.getLogger(classOf[SessionMappingStorageConfiguration])

  @Bean
  def sessionMappingStorage(): SessionMappingStorage = {
    val jdbcSessionMappingStorage =
      new JdbcSessionMappingStorage(sessionRepository.asInstanceOf[SessionRepository[Session]], db)
    jdbcSessionMappingStorage
  }
}
