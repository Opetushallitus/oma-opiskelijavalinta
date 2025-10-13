package fi.oph.opiskelijavalinta.configuration

import org.springframework.context.annotation.{Bean, Configuration}
import slick.jdbc.JdbcBackend

import javax.sql.DataSource

@Configuration
class DBConfiguration {

  @Bean
  def getDatabase(dataSource: DataSource): JdbcBackend.JdbcDatabaseDef =
    JdbcBackend.Database.forDataSource(dataSource, None)

}
