package fi.oph.opiskelijavalinta.dto

import fi.oph.opiskelijavalinta.service.AllowedIlmoittautumisTila
import jakarta.validation.constraints.NotNull

case class IlmoittautuminenDTO(
  @NotNull(message = "ilmoittautumistila is required") ilmoittautumisTila: AllowedIlmoittautumisTila,
  @NotNull(message = "hakuOid is required") hakuOid: String
)
