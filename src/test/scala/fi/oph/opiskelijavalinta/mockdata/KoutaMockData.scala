package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.Constants.KOULUTUKSEN_ALKAMISKAUSI_KEVAT
import fi.oph.opiskelijavalinta.TestUtils.{HAKUKOHDE_OID, HAKUKOHDE_OID_2, HAKU_OID}
import fi.oph.opiskelijavalinta.model.{
  Haku,
  Hakuaika,
  Hakukohde,
  PaateltyAlkamisajankohta,
  PaateltyAlkamiskausi,
  TranslatedName
}
import fi.oph.opiskelijavalinta.util.TimeUtils.{KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}

import java.time.ZonedDateTime

object KoutaMockData {
  val koutaFormatFutureDate: String = KOUTA_DATETIME_FORMATTER.format(ZonedDateTime.now(ZONE_FINLAND).plusDays(1))

  val kaynnissaOlevaHaku: Haku = Haku(
    HAKU_OID,
    TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search"),
    "haunkohdejoukko_20",
    "hakutapa_01",
    Seq(Hakuaika("2024-11-19T09:32:01", koutaFormatFutureDate))
  )

  val hakuaikaPaattynytHaku: Haku = Haku(
    "1.2.246.562.29.00000000000000038405",
    TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search"),
    "haunkohdejoukko_20",
    "hakutapa_01",
    Seq(Hakuaika("2024-11-19T09:32:01", "2024-11-29T09:32:01"))
  )

  val hakukohde1: Hakukohde = Hakukohde(
    HAKUKOHDE_OID,
    TranslatedName("Liukumäen lisensiaatti", "", ""),
    TranslatedName("Leikkipuisto, Liukumäki", "", ""),
    None,
    Some(PaateltyAlkamiskausi(kausiUri = Some(KOULUTUKSEN_ALKAMISKAUSI_KEVAT))),
    Some(PaateltyAlkamisajankohta(pvm = "2029-01-01", henkilokohtainenSuunnitelma = false))
  )

  val hakukohde2: Hakukohde = Hakukohde(
    HAKUKOHDE_OID_2,
    TranslatedName("Hiekkalaatikon arkeologi", "", ""),
    TranslatedName("Leikkipuisto, Hiekkalaatikko", "", ""),
    None,
    None,
    None
  )
}
