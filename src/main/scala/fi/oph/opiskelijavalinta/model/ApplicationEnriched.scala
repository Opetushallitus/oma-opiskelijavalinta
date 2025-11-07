package fi.oph.opiskelijavalinta.model

case class ApplicationEnriched(oid: String, haku: Option[Haku], hakukohteet: Set[Option[Hakukohde]], secret: String)

