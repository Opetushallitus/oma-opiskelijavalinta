package fi.oph.opiskelijavalinta.model

case class HakemusEnriched(
  oid: String,
  haku: Option[HakuEnriched],
  hakukohteet: List[Option[Hakukohde]],
  ohjausparametrit: Option[Ohjausparametrit],
  secret: String,
  submitted: String,
  hakemuksenTulokset: List[HakutoiveenTulos],
  formName: TranslatedName
)

case class HakemuksetEnriched(current: Seq[HakemusEnriched], old: Seq[HakemusEnriched])
