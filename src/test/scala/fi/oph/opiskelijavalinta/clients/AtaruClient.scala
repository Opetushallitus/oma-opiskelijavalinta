package fi.oph.opiskelijavalinta.clients

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Profile(Array("test"))
@Component
class AtaruClient {

  def getApplications(oppijanumero: String): Either[Throwable, String] = {
    Right("[{\"haku\": \"haku-1\", \"hakukohteet\": [\"hk-1\", \"hk-2\"], \"secret\": \"secret1\"}]")
  }
}
