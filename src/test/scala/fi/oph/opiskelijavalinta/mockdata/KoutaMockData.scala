package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.model.{Haku, Hakuaika, Hakukohde, TranslatedName}
import fi.oph.opiskelijavalinta.util.TimeUtils.{KOUTA_DATETIME_FORMATTER, ZONE_FINLAND}

import java.time.ZonedDateTime

object KoutaMockData {
  val koutaFormatFutureDate = KOUTA_DATETIME_FORMATTER.format(ZonedDateTime.now(ZONE_FINLAND).plusDays(1))

  val kaynnissaOlevaHaku = Haku(
    "haku-oid-1",
    TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search"),
    Seq(Hakuaika("2024-11-19T09:32:01", koutaFormatFutureDate))
  )

  val hakuaikaPaattynytHaku = Haku(
    "haku-oid-1",
    TranslatedName("Leikkipuiston jatkuva haku", "Samma på svenska", "Playground search"),
    Seq(Hakuaika("2024-11-19T09:32:01", "2024-11-29T09:32:01"))
  )

  val hakukohde1 = Hakukohde(
    "hakukohde-oid-1",
    TranslatedName("Liukumäen lisensiaatti", "", ""),
    TranslatedName("Leikkipuisto, Liukumäki", "", "")
  )
  val hakukohde2 = Hakukohde(
    "hakukohde-oid-2",
    TranslatedName("Hiekkalaatikon arkeologi", "", ""),
    TranslatedName("Leikkipuisto, Hiekkalaatikko", "", "")
  )
}
