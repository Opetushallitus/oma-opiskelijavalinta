package fi.oph.opiskelijavalinta.model

enum YosVirhe:
  case VIRHE_HAKUTOIVEEN_PAATTELYSSA
  case VIRHE_PAATETTAVIEN_OPISKELUOIKEUKSIEN_HAUSSA
  case PUUTTUVAT_OIKEUDET
  case PUUTTEELLISET_PARAMETRIT

case class PaatettavaOpiskeluOikeus(
  tunniste: String,
  organisaatioOid: String,
  organisaatioNimi: TranslatedName,
  nimi: TranslatedName,
  koulutusKoodi: String
)

case class PaatettavatOpiskeluOikeudetResponse(
  paatettavatOpiskeluOikeudet: Option[List[PaatettavaOpiskeluOikeus]],
  virhe: Option[YosVirhe],
  viesti: Option[String]
)
