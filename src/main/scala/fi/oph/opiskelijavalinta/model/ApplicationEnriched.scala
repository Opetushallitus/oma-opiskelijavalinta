package fi.oph.opiskelijavalinta.model

case class ApplicationEnriched(oid: String, haku: Haku, hakukohteet: List[String], secret: String)

