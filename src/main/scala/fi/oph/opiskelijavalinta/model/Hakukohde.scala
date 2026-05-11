package fi.oph.opiskelijavalinta.model

case class YhdenPaikanSaanto(voimassa: Boolean)

case class PaateltyAlkamiskausi(kausiUri: Option[String])

case class Hakukohde(
  oid: String,
  nimi: TranslatedName,
  jarjestyspaikkaHierarkiaNimi: TranslatedName,
  uudenOpiskelijanUrl: Option[TranslatedName],
  paateltyAlkamiskausi: Option[PaateltyAlkamiskausi],
  yhdenPaikanSaanto: YhdenPaikanSaanto = YhdenPaikanSaanto(false)
)

case class HakukohdeEnriched(
  oid: String,
  nimi: TranslatedName,
  jarjestyspaikkaHierarkiaNimi: TranslatedName,
  uudenOpiskelijanUrl: Option[TranslatedName],
  yhdenPaikanSaanto: YhdenPaikanSaanto = YhdenPaikanSaanto(false),
  koulutuksenAlkamiskausi: Option[String]
)
