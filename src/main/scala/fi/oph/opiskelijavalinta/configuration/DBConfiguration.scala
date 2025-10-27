package fi.oph.opiskelijavalinta.configuration

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration}
import slick.jdbc.JdbcBackend

import java.util.concurrent.Executors
import javax.sql.DataSource
import scala.concurrent.ExecutionContext

@Configuration
class DBConfiguration(@Value("${app.db.threads:8}") val dbThreads: Int) {

  // for production setup use a separate thread pool for database operations
  private val dbThreadPool = Executors.newFixedThreadPool(dbThreads)

  @Bean
  def slickExecutionContext(): ExecutionContext =
    ExecutionContext.fromExecutor(dbThreadPool)

  @Bean
  def getDatabase(dataSource: DataSource): JdbcBackend.JdbcDatabaseDef =
    JdbcBackend.Database.forDataSource(dataSource, None)

}
