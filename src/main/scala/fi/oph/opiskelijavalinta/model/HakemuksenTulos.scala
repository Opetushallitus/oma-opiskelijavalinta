package fi.oph.opiskelijavalinta.model

case class HakemuksenTulos(
  hakuOid: Option[String],
  hakemusOid: Option[String],
  hakijaOid: Option[String],
  hakutoiveet: List[HakutoiveenTulos] // empty list if missing
)

case class HakutoiveenTulos(
  hakukohdeOid: Option[String],
  hakukohdeNimi: Option[String],
  tarjoajaOid: Option[String],
  tarjoajaNimi: Option[String],
  valintatapajonoOid: Option[String],
  valintatila: Option[String],
  vastaanottotila: Option[String],
  ilmoittautumistila: Option[Ilmoittautumistila],
  vastaanotettavuustila: Option[String],
  vastaanottoDeadline: Option[String],
  viimeisinHakemuksenTilanMuutos: Option[String],
  hyvaksyttyJaJulkaistuDate: Option[String],
  varasijanumero: Option[Int],
  julkaistavissa: Option[Boolean],
  ehdollisestiHyvaksyttavissa: Option[Boolean],
  ehdollisenHyvaksymisenEhtoKoodi: Option[String],
  ehdollisenHyvaksymisenEhtoFI: Option[String],
  ehdollisenHyvaksymisenEhtoSV: Option[String],
  ehdollisenHyvaksymisenEhtoEN: Option[String],
  tilanKuvaukset: Option[Map[String, String]],
  showMigriURL: Option[Boolean],
  ilmoittautumisenAikaleima: Option[String],
  jonokohtaisetTulostiedot: List[JonokohtainenTulostieto] // empty list if missing
)

case class Ilmoittautumistapa(
  nimi: Option[TranslatedName]
)

case class Ilmoittautumistila(
  ilmoittautumisaika: Option[Map[String, String]],
  ilmoittautumistila: Option[String],
  ilmoittauduttavissa: Option[Boolean],
  ilmoittautumistapa: Option[Ilmoittautumistapa]
)

case class Ilmoittautumistapa(
  nimi: Option[Map[String, String]],
  url: Option[String]
)

case class JonokohtainenTulostieto(
  oid: Option[String],
  nimi: Option[String],
  pisteet: Option[BigDecimal],
  alinHyvaksyttyPistemaara: Option[BigDecimal],
  valintatila: Option[String],
  julkaistavissa: Option[Boolean],
  valintatapajonoPrioriteetti: Option[Int],
  tilanKuvaukset: Option[Map[String, String]],
  ehdollisestiHyvaksyttavissa: Option[Boolean],
  ehdollisenHyvaksymisenEhto: Option[Map[String, String]],
  varasijanumero: Option[Int],
  eiVarasijatayttoa: Option[Boolean],
  varasijat: Option[Int],
  varasijasaannotKaytossa: Option[Boolean]
)
