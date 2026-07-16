package fi.oph.opiskelijavalinta.model

enum YosVirhe:
  case VIRHE_HAKUTOIVEEN_PAATTELYSSA
  case VIRHE_PAATETTAVIEN_OPISKELUOIKEUKSIEN_HAUSSA
  case PUUTTUVAT_OIKEUDET
  case PUUTTEELLISET_PARAMETRIT

case class PaatettavaOpiskeluOikeus(
  virtaOpiskeluOikeusId: String,
  organisaatioOid: String,
  organisaatioNimi: TranslatedName,
  virtaNimi: TranslatedName,
  supaNimi: TranslatedName
)

case class PaatettavatOpiskeluOikeudetResponse(
  paatettavatOpiskeluOikeudet: Option[List[PaatettavaOpiskeluOikeus]],
  virhe: Option[YosVirhe],
  viesti: Option[String]
)
