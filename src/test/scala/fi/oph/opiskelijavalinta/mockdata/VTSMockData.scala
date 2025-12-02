package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.model.{
  Aikataulu,
  HakemuksenTulos,
  HakutoiveenTulos,
  Ilmoittautumistila,
  JonokohtainenTulos
}

object VTSMockData {

  val hakutoive1 = HakutoiveenTulos(
    hakukohdeOid = Some("hakukohde-oid-1"),
    hakukohdeNimi = Some("Liukumäen lisensiaatti"),
    tarjoajaOid = Some("organisaatio-oid-1"),
    tarjoajaNimi = Some("Leikkipuisto, Liukumäki"),
    valintatapajonoOid = Some("12246562200000000000000007599136"),
    valintatila = Some("HYVAKSYTTY"),
    vastaanottotila = Some("KESKEN"),
    ilmoittautumistila = Some(
      Ilmoittautumistila(
        ilmoittautumisaika = Some(Map("loppu" -> "2026-01-16T21:59:59Z")),
        ilmoittautumistila = Some("EI_TEHTY"),
        ilmoittauduttavissa = Some(false)
      )
    ),
    vastaanotettavuustila = Some("VASTAANOTETTAVISSA_SITOVASTI"),
    vastaanottoDeadline = Some("2025-12-12T13:00:00Z"),
    viimeisinHakemuksenTilanMuutos = Some("2025-11-17T08:25:19Z"),
    hyvaksyttyJaJulkaistuDate = Some("2025-11-17T08:25:23Z"),
    julkaistavissa = Some(true),
    ehdollisestiHyvaksyttavissa = Some(false),
    tilanKuvaukset = Some(Map.empty),
    showMigriURL = Some(false),
    jonokohtaisetTulostiedot = List(
      JonokohtainenTulos(
        oid = Some("12246562200000000000000007599136"),
        nimi = Some(""),
        valintatila = Some("HYVAKSYTTY"),
        julkaistavissa = Some(true),
        tilanKuvaukset = Some(Map.empty),
        ehdollisestiHyvaksyttavissa = Some(false),
        ehdollisenHyvaksymisenEhto = Some(Map.empty),
        eiVarasijatayttoa = Some(false),
        varasijasaannotKaytossa = Some(false)
      )
    )
  )

  val hakutoive2 = HakutoiveenTulos(
    hakukohdeOid = Some("hakukohde-oid-2"),
    hakukohdeNimi = Some("Hiekkalaatikon arkeologi"),
    tarjoajaOid = Some("organisaatio-oid-2"),
    tarjoajaNimi = Some("Leikkipuisto, Hiekkalaatikko"),
    valintatapajonoOid = Some(""),
    valintatila = Some("KESKEN"),
    vastaanottotila = Some("KESKEN"),
    ilmoittautumistila = Some(
      Ilmoittautumistila(
        ilmoittautumisaika = Some(Map("loppu" -> "2026-01-16T21:59:59Z")),
        ilmoittautumistila = Some("EI_TEHTY"),
        ilmoittauduttavissa = Some(false)
      )
    ),
    vastaanotettavuustila = Some("EI_VASTAANOTETTAVISSA"),
    vastaanottoDeadline = None,
    viimeisinHakemuksenTilanMuutos = None,
    hyvaksyttyJaJulkaistuDate = None,
    julkaistavissa = Some(false),
    ehdollisestiHyvaksyttavissa = Some(false),
    tilanKuvaukset = Some(Map.empty),
    showMigriURL = None,
    jonokohtaisetTulostiedot = List.empty
  )

  val aikataulu = Aikataulu(
    vastaanottoEnd = Some("1970-01-01T13:00:00Z"),
    vastaanottoBufferDays = Some(14)
  )

  val mockVTSResponse = HakemuksenTulos(
    hakuOid = Some("1.2.246.562.29.00000000000000065738"),
    hakemusOid = Some("1.2.246.562.11.00000000000002954903"),
    hakijaOid = Some("1.2.246.562.24.97280766274"),
    aikataulu = Some(aikataulu),
    hakutoiveet = List(hakutoive1, hakutoive2)
  )

}
