package fi.oph.opiskelijavalinta.model

case class ApplicationEnriched(oid: String, haku: Option[HakuEnriched], hakukohteet: Set[Option[Hakukohde]], ohjausparametrit: Option[Ohjausparametrit], secret: String, submitted: String, hakemuksenTulokset: List[HakutoiveenTulos], formName: TranslatedName)

case class ApplicationsEnriched(current: Seq[ApplicationEnriched], old: Seq[ApplicationEnriched])