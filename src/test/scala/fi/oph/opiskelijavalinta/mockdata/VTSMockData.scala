package fi.oph.opiskelijavalinta.mockdata

import fi.oph.opiskelijavalinta.model.{HakemuksenTulos, HakutoiveenTulos, Ilmoittautumistila, JonokohtainenTulostieto}

object VTSMockData {

  val hakutoive1Hyvaksytty = HakutoiveenTulos(
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
    varasijanumero = None,
    julkaistavissa = Some(true),
    ehdollisestiHyvaksyttavissa = Some(false),
    ehdollisenHyvaksymisenEhtoKoodi = None,
    ehdollisenHyvaksymisenEhtoFI = None,
    ehdollisenHyvaksymisenEhtoSV = None,
    ehdollisenHyvaksymisenEhtoEN = None,
    tilanKuvaukset = Some(Map.empty),
    showMigriURL = Some(false),
    jonokohtaisetTulostiedot = List(
      JonokohtainenTulostieto(
        oid = Some("12246562200000000000000007599136"),
        nimi = Some("todistusvalinta"),
        pisteet = None,
        alinHyvaksyttyPistemaara = None,
        valintatila = Some("HYVAKSYTTY"),
        julkaistavissa = Some(true),
        valintatapajonoPrioriteetti = Some(1),
        tilanKuvaukset = Some(Map.empty),
        ehdollisestiHyvaksyttavissa = Some(false),
        ehdollisenHyvaksymisenEhto = Some(Map.empty),
        eiVarasijatayttoa = Some(false),
        varasijanumero = None,
        varasijat = None,
        varasijasaannotKaytossa = Some(false)
      )
    )
  )

  val hakutoive2Kesken = HakutoiveenTulos(
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
    varasijanumero = None,
    julkaistavissa = Some(false),
    ehdollisestiHyvaksyttavissa = Some(false),
    ehdollisenHyvaksymisenEhtoKoodi = None,
    ehdollisenHyvaksymisenEhtoFI = None,
    ehdollisenHyvaksymisenEhtoSV = None,
    ehdollisenHyvaksymisenEhtoEN = None,
    tilanKuvaukset = Some(Map.empty),
    showMigriURL = None,
    jonokohtaisetTulostiedot = List.empty
  )

  val mockVTSResponse = HakemuksenTulos(
    hakuOid = Some("1.2.246.562.29.00000000000000065738"),
    hakemusOid = Some("1.2.246.562.11.00000000000002954903"),
    hakijaOid = Some("1.2.246.562.24.97280766274"),
    hakutoiveet = List(hakutoive1Hyvaksytty, hakutoive2Kesken)
  )

  val mockVTSKeskenResponse = HakemuksenTulos(
    hakuOid = Some("1.2.246.562.29.00000000000000065738"),
    hakemusOid = Some("1.2.246.562.11.00000000000002954903"),
    hakijaOid = Some("1.2.246.562.24.97280766274"),
    hakutoiveet = List(
      hakutoive1Hyvaksytty.copy(
        julkaistavissa = Some(false),
        valintatila = Some("KESKEN"),
        vastaanotettavuustila = Some("EI_VASTAANOTETTAVISSA"),
        vastaanottoDeadline = None
      ),
      hakutoive2Kesken
    )
  )

}
