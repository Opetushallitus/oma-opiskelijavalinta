package fi.oph.opiskelijavalinta.model

case class HakemusEnriched(
  oid: String,
  haku: Option[HakuEnriched],
  hakukohteet: List[Hakukohde],
  ohjausparametrit: Option[Ohjausparametrit],
  secret: String,
  submitted: String,
  hakemuksenTulokset: List[HakutoiveenTulosEnriched],
  processing: Boolean,
  formName: TranslatedName,
  tuloskirjeModified: Option[Long],
  enrichmentFailed: Boolean = false
)

case class HakemuksetEnriched(current: Seq[HakemusEnriched], old: Seq[HakemusEnriched])
