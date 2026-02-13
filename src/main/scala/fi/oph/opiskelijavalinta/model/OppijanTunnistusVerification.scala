package fi.oph.opiskelijavalinta.model

case class OppijanTunnistusVerification(exists: Boolean, valid: Boolean, metadata: Option[OppijantunnistusMetadata])

case class OppijantunnistusMetadata(hakemusOid: String, personOid: Option[String], hakuOid: Option[String])

