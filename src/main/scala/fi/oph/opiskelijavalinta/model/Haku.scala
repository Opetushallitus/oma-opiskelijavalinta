package fi.oph.opiskelijavalinta.model

import java.time.LocalDateTime

case class Hakuaika(alkaa: String, paattyy: String)

case class Koodi(koodiUri: Option[String])

case class Metadata(
  koulutuksenAlkamiskausi: Option[KoulutuksenAlkamiskausi],
  varasijatayttoPaattyy: Option[LocalDateTime] = None
)

case class KoulutuksenAlkamiskausi(koulutuksenAlkamiskausi: Option[Koodi])

case class Haku(
  oid: String,
  nimi: TranslatedName,
  hakutapaKoodiUri: String,
  kohdejoukkoKoodiUri: String,
  hakuajat: Seq[Hakuaika],
  metadata: Option[Metadata],
  alkamiskausiKoodiUri: Option[String],
  alkamisvuosi: Option[String]
)

case class HakuEnriched(
  oid: String,
  nimi: TranslatedName,
  hakuaikaKaynnissa: Boolean,
  viimeisinPaattynytHakuAika: Option[Long],
  kohdejoukkoKoodiUri: String,
  hakutapaKoodiUri: String,
  alkamiskausi: Option[String],
  alkamisvuosi: Option[String],
  varasijatayttoPaattyy: Option[Long]
)
