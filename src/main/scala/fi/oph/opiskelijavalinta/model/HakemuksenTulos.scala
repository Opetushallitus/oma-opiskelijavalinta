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
  julkaistavissa: Option[Boolean],
  ehdollisestiHyvaksyttavissa: Option[Boolean],
  ehdollisenHyvaksymisenEhtoKoodi: Option[String],
  ehdollisenHyvaksymisenEhtoFI: Option[String],
  ehdollisenHyvaksymisenEhtoSV: Option[String],
  ehdollisenHyvaksymisenEhtoEN: Option[String],
  tilanKuvaukset: Option[Map[String, String]],
  showMigriURL: Option[Boolean],
  jonokohtaisetTulostiedot: List[JonokohtainenTulos] // empty list if missing
)

case class Ilmoittautumistila(
  ilmoittautumisaika: Option[Map[String, String]],
  ilmoittautumistila: Option[String],
  ilmoittauduttavissa: Option[Boolean]
)

case class JonokohtainenTulos(
  oid: Option[String],
  nimi: Option[String],
  valintatila: Option[String],
  julkaistavissa: Option[Boolean],
  tilanKuvaukset: Option[Map[String, String]],
  ehdollisestiHyvaksyttavissa: Option[Boolean],
  ehdollisenHyvaksymisenEhto: Option[Map[String, String]],
  eiVarasijatayttoa: Option[Boolean],
  varasijasaannotKaytossa: Option[Boolean]
)
