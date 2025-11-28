package fi.oph.opiskelijavalinta.model

import java.util.Date

case class Hakuaika(alkaa: String, paattyy: String)

case class Haku(oid: String, nimi: TranslatedName, hakuajat: Seq[Hakuaika])

case class HakuEnriched(
    oid: String,
    nimi: TranslatedName,
    hakuaikaKaynnissa: Boolean,
    viimeisinPaattynytHakuAika: String
)
