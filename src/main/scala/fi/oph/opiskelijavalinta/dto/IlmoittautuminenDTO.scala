package fi.oph.opiskelijavalinta.dto

import fi.oph.opiskelijavalinta.service.AllowedIlmoittautumisTila

case class IlmoittautuminenDTO(
  ilmoittautumisTila: AllowedIlmoittautumisTila,
  hakuOid: String
)
