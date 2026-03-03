package fi.oph.opiskelijavalinta.model

case class HakemusEnriched(
  oid: String,
  haku: Option[HakuEnriched],
  hakukohteet: List[Option[Hakukohde]],
  ohjausparametrit: Option[Ohjausparametrit],
  secret: String,
  submitted: String,
  hakemuksenTulokset: List[HakutoiveenTulosEnriched],
  processing: Boolean,
  formName: TranslatedName,
  tuloskirjeModified: Option[Long]
)

case class HakemuksetEnriched(current: Seq[HakemusEnriched], old: Seq[HakemusEnriched])
