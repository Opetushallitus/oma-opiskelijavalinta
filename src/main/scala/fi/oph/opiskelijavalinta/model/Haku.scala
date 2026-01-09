package fi.oph.opiskelijavalinta.model

import java.util.Date

case class Hakuaika(alkaa: String, paattyy: String)

case class Haku(
  oid: String,
  nimi: TranslatedName,
  hakutapaKoodiUri: String,
  kohdejoukkoKoodiUri: String,
  hakuajat: Seq[Hakuaika]
)

case class HakuEnriched(
  oid: String,
  nimi: TranslatedName,
  hakuaikaKaynnissa: Boolean,
  viimeisinPaattynytHakuAika: String,
  kohdejoukkoKoodiUri: String,
  hakutapaKoodiUri: String
)
