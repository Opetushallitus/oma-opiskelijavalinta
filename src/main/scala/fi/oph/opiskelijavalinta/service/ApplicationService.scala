package fi.oph.opiskelijavalinta.service

import fi.oph.opiskelijavalinta.model.Application
import org.springframework.stereotype.Service


@Service
class ApplicationService {

  def getApplications(oppijanumero: String): List[Application] = {
    List(
      Application("haku-1", List("hk-1", "hk-2"), "secret"),
      Application("haku-2", List("hk-3", "hk-4", "hk-8"), "secret"),
      Application("haku-3", List("hk-5", "hk-9"), "secret"))
  }
}
