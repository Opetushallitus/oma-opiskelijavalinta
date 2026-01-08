package fi.oph.opiskelijavalinta.model

case class YhdenPaikanSaanto(voimassa: Boolean)

case class Hakukohde(oid: String, nimi: TranslatedName, jarjestyspaikkaHierarkiaNimi: TranslatedName, yhdenPaikanSaanto: YhdenPaikanSaanto = YhdenPaikanSaanto(false))
