package fi.oph.opiskelijavalinta.model

case class Hakuaika(alkaa: String, paattyy: String)

case class Koodi(koodiUri: Option[String])

case class KoulutuksenAlkamiskausi(koulutuksenAlkamiskausi: Option[Koodi])

case class Metadata(koulutuksenAlkamiskausi: Option[KoulutuksenAlkamiskausi])

case class Haku(
  oid: String,
  nimi: TranslatedName,
  hakutapaKoodiUri: String,
  kohdejoukkoKoodiUri: String,
  hakuajat: Seq[Hakuaika],
  metadata: Option[Metadata]
)

case class HakuEnriched(
  oid: String,
  nimi: TranslatedName,
  hakuaikaKaynnissa: Boolean,
  viimeisinPaattynytHakuAika: Option[Long],
  kohdejoukkoKoodiUri: String,
  hakutapaKoodiUri: String,
  koulutuksenAlkamiskausi: Option[String]
)
