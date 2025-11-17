package fi.oph.opiskelijavalinta.model

case class HakemuksenTulos(
                            hakuOid: Option[String],
                            hakemusOid: Option[String],
                            hakijaOid: Option[String],
                            aikataulu: Option[Aikataulu],
                            hakutoiveet: List[Hakutoive]    // empty list if missing
                          )

case class Aikataulu(
                      vastaanottoEnd: Option[String],
                      vastaanottoBufferDays: Option[Int]
                    )

case class Hakutoive(
                      hakukohdeOid: Option[String],
                      hakukohdeNimi: Option[String],
                      tarjoajaOid: Option[String],
                      tarjoajaNimi: Option[String],
                      valintatapajonoOid: Option[String],
                      valintatila: Option[String],
                      vastaanottotila: Option[String],
                      ilmoittautumistila: Option[IlmoittautumisTila],
                      vastaanotettavuustila: Option[String],
                      vastaanottoDeadline: Option[String],
                      viimeisinHakemuksenTilanMuutos: Option[String],
                      hyvaksyttyJaJulkaistuDate: Option[String],
                      julkaistavissa: Option[Boolean],
                      ehdollisestiHyvaksyttavissa: Option[Boolean],
                      tilanKuvaukset: Option[Map[String, String]],
                      showMigriURL: Option[Boolean],
                      jonokohtaisetTulostiedot: List[JonoKohtainenTulos]   // empty list if missing
                    )

case class IlmoittautumisTila(
                               ilmoittautumisaika: Option[Map[String, String]],
                               ilmoittautumistila: Option[String],
                               ilmoittauduttavissa: Option[Boolean]
                             )

case class JonoKohtainenTulos(
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