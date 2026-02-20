package fi.oph.opiskelijavalinta.security

import fi.oph.opiskelijavalinta.model.{OppijanTunnistusVerification, OppijantunnistusMetadata}
import org.springframework.stereotype.Service

@Service
class LinkVerificationService {

  // TODO OPHYOS-77, temp kovakoodaus
  def verify(token: String): OppijanTunnistusVerification = {

    if (token == "valid-token") {
      OppijanTunnistusVerification(
        exists = true,
        valid = true,
        metadata = Some(
          OppijantunnistusMetadata(
            hakemusOid = "1.2.246.562.11.00000000001",
            personOid = Some("1.2.246.562.24.12345678901"),
            hakuOid = Some("1.2.246.562.29.00000000001")
          )
        )
      )
    } else {
      OppijanTunnistusVerification(
        exists = false,
        valid = false,
        metadata = None
      )
    }
  }
}
