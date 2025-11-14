package fi.oph.opiskelijavalinta.model

case class ApplicationEnriched(oid: String, haku: Option[Haku], hakukohteet: Set[Option[Hakukohde]], ohjausparametrit: Option[Ohjausparametrit], secret: String)

