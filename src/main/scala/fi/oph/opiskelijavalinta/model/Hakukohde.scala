package fi.oph.opiskelijavalinta.model

case class YhdenPaikanSaanto(voimassa: Boolean)

case class PaateltyAlkamiskausi(kausiUri: Option[String])

case class PaateltyAlkamisAjankohta(pvm: String, henkilokohtainenSuunnitelma: Boolean)

case class Hakukohde(
  oid: String,
  nimi: TranslatedName,
  jarjestyspaikkaHierarkiaNimi: TranslatedName,
  uudenOpiskelijanUrl: Option[TranslatedName],
  paateltyAlkamiskausi: Option[PaateltyAlkamiskausi],
  paateltyAlkamisajankohta: Option[PaateltyAlkamisAjankohta],
  yhdenPaikanSaanto: YhdenPaikanSaanto = YhdenPaikanSaanto(false)
)

case class HakukohdeEnriched(
  oid: String,
  nimi: TranslatedName,
  jarjestyspaikkaHierarkiaNimi: TranslatedName,
  uudenOpiskelijanUrl: Option[TranslatedName],
  koulutuksenAlkamiskausi: Option[String],
  koulutuksenAlkamisPvm: Option[String],
  yhdenPaikanSaanto: YhdenPaikanSaanto = YhdenPaikanSaanto(false)
)
