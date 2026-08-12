package fi.oph.opiskelijavalinta.util

import scala.concurrent.Await
import slick.jdbc.PostgresProfile.api.*

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.Duration

object DBUtil {
  extension (database: Database) {
    def runBlocking[R](operations: DBIO[R], timeout: Duration): R = {
      Await.result(
        database.run(
          operations.withStatementParameters(statementInit = st => st.setQueryTimeout(timeout.toSeconds.toInt))
        ),
        timeout + Duration(1, TimeUnit.SECONDS)
      )
    }
  }
}
