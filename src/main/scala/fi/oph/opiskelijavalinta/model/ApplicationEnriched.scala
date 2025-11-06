package fi.oph.opiskelijavalinta.model

case class ApplicationEnriched(oid: String, haku: Haku, hakukohteet: Set[Hakukohde], secret: String)

