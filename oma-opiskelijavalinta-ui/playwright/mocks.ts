import { clone } from 'remeda';

export const hakemus1 = {
  oid: 'hakemus-oid-1',
  secret: 'secret-1',
  haku: {
    oid: 'haku-oid-1',
    nimi: { fi: 'Hurrikaaniopiston erillishaku 2025' },
    hakuaikaKaynnissa: true,
    viimeisinPaattynytHakuAika: '2025-10-19T13:00:00',
    hakutapaKoodiUri: 'hakutapa_02',
    kohdejoukkoKoodiUri: 'haunkohdejoukko_12',
  },
  submitted: '2025-10-18T16:00:00',
  hakukohteet: [
    {
      oid: 'hakukohde-oid-1',
      nimi: { fi: 'Meteorologi, Tornadoinen tutkimislinja' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Hurrikaaniopisto, Hiekkalinnan kampus',
      },
    },
    {
      oid: 'hakukohde-oid-2',
      nimi: { fi: 'Meteorologi, Hurrikaanien tutkimislinja' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Hurrikaaniopisto, Myrskynsilmän kampus',
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763471212000,
    jarjestetytHakutoiveet: true,
    valintaTuloksetJulkaistaanHakijoilleAlkaa: 1779271212000,
    varasijatayttoPaattyy: 1779471212000,
  },
  hakemuksenTulokset: [],
};

export const hakemus2 = {
  oid: 'hakemus-oid-2',
  secret: 'secret-2',
  haku: {
    oid: 'haku-oid-2',
    nimi: { fi: 'Tsunamiopiston tohtoritutkinnon haku 2025' },
    hakuaikaKaynnissa: false,
    viimeisinPaattynytHakuAika: '2025-06-19T09:00:00',
    hakutapaKoodiUri: 'hakutapa_02',
    kohdejoukkoKoodiUri: 'haunkohdejoukko_12',
  },
  submitted: '2025-06-18T19:00:00',
  hakukohteet: [
    {
      oid: 'hakukohde-oid-3',
      nimi: { fi: 'Meteorologi, Hyökyaaltojen tutkimislinja' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Tsunamiopisto, Merenpohjan kampus',
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763971212000,
  },
  hakemuksenTulokset: [],
};

export const TOISEN_ASTEEN_YHTEISHAKU = {
  oid: 'haku-oid-3',
  nimi: { fi: 'Toisten asteen yhteishaku 2024' },
  hakuaikaKaynnissa: false,
  viimeisinPaattynytHakuAika: '2025-06-19T09:00:00',
  hakutapaKoodiUri: 'hakutapa_01',
  kohdejoukkoKoodiUri: 'haunkohdejoukko_11',
};

export const JATKUVA_HAKU = {
  oid: 'haku-oid-4',
  nimi: { fi: 'Rötkönperän jatkuva haku' },
  hakuaikaKaynnissa: true,
  hakutapaKoodiUri: 'hakutapa_03',
  kohdejoukkoKoodiUri: 'haunkohdejoukko_23',
};

export const hakemus3ToinenAste = {
  oid: 'hakemus-oid-3',
  secret: 'secret-3',
  haku: TOISEN_ASTEEN_YHTEISHAKU,
  submitted: '2025-06-18T19:00:00',
  hakukohteet: [
    {
      oid: 'hakukohde-oid-4',
      nimi: { fi: 'Lukiokoulutus' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Rekun Lukio, Helsingin Kaupunki',
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763971212000,
  },
  hakemuksenTulokset: [
    {
      hakukohdeOid: 'hakukohde-oid-4',
      hakukohdeNimi: 'Lukiokoulutus',
      tarjoajaOid: 'tarjoaja-oid-4',
      tarjoajaNimi: 'Rekun Lukio, Helsingin Kaupunki',
      valintatapajonoOid: '2349',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: 'KESKEN',
      ilmoittautumistila: {
        ilmoittautumisaika: {},
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
      hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      tilanKuvaukset: {},
      showMigriURL: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2349',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          tilanKuvaukset: {},
          ehdollisestiHyvaksyttavissa: false,
          ehdollisenHyvaksymisenEhto: {},
          eiVarasijatayttoa: false,
          varasijasaannotKaytossa: false,
        },
      ],
    },
  ],
};

export const hakemus4ToinenAsteAlempiaHyvaksyttyja = {
  oid: 'hakemus-oid-4',
  secret: 'secret-4',
  haku: TOISEN_ASTEEN_YHTEISHAKU,
  submitted: '2025-06-18T19:00:00',
  hakukohteet: [
    {
      oid: 'hakukohde-oid-4',
      nimi: { fi: 'Lukiokoulutus' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Rekun Lukio, Helsingin Kaupunki',
      },
    },
    {
      oid: 'hakukohde-oid-5',
      nimi: { fi: 'Ajoneuvoalan perustutkinto' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Romuttamo, Romujenkerääjät RY',
      },
    },
    {
      oid: 'hakukohde-oid-6',
      nimi: { fi: 'Putkimiehen perustutkinto' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Putkittamo, Putket Vuotaa OY',
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763971212000,
    jarjestetytHakutoiveet: true,
  },
  hakemuksenTulokset: [
    {
      hakukohdeOid: 'hakukohde-oid-4',
      hakukohdeNimi: 'Lukiokoulutus',
      tarjoajaOid: 'tarjoaja-oid-4',
      tarjoajaNimi: 'Rekun Lukio, Helsingin Kaupunki',
      valintatapajonoOid: '2349',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: 'KESKEN',
      ilmoittautumistila: {
        ilmoittautumisaika: {},
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
      hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      tilanKuvaukset: {},
      showMigriURL: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2349',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          tilanKuvaukset: {},
          ehdollisestiHyvaksyttavissa: false,
          ehdollisenHyvaksymisenEhto: {},
          eiVarasijatayttoa: false,
          varasijasaannotKaytossa: false,
        },
      ],
    },
    {
      hakukohdeOid: 'hakukohde-oid-5',
      hakukohdeNimi: 'Ajoneuvoalan perustutkinto',
      tarjoajaOid: 'tarjoaja-oid-5',
      tarjoajaNimi: 'Romuttamo, Romujenkerääjät RY',
      valintatapajonoOid: '2358',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: 'VASTAANOTTANUT_SITOVASTI',
      ilmoittautumistila: {
        ilmoittautumisaika: {},
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
      hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      tilanKuvaukset: {},
      showMigriURL: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2358',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          tilanKuvaukset: {},
          ehdollisestiHyvaksyttavissa: false,
          ehdollisenHyvaksymisenEhto: {},
          eiVarasijatayttoa: false,
          varasijasaannotKaytossa: false,
        },
      ],
    },
    {
      hakukohdeOid: 'hakukohde-oid-6',
      hakukohdeNimi: 'Putkimiehen perustutkinto',
      tarjoajaOid: 'tarjoaja-oid-6',
      tarjoajaNimi: 'Putkittamo, Putket Vuotaa OY',
      valintatapajonoOid: '2359',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: 'VASTAANOTTANUT_SITOVASTI',
      ilmoittautumistila: {
        ilmoittautumisaika: {},
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
      hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      tilanKuvaukset: {},
      showMigriURL: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2359',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          tilanKuvaukset: {},
          ehdollisestiHyvaksyttavissa: false,
          ehdollisenHyvaksymisenEhto: {},
          eiVarasijatayttoa: false,
          varasijasaannotKaytossa: false,
        },
      ],
    },
  ],
};

export const hakemus5JatkuvaHaku = {
  oid: 'hakemus-oid-5',
  secret: 'secret-5',
  haku: JATKUVA_HAKU,
  submitted: '2025-12-18T19:00:00',
  processing: false,
  hakukohteet: [
    {
      oid: 'hakukohde-oid-7',
      nimi: { fi: 'Penkkiurheilijan diplomi' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Lötkönperän koulutuskeskus, Sohva',
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1769971212000,
    jarjestetytHakutoiveet: false,
    valintaTuloksetJulkaistaanHakijoilleAlkaa: 1769271212000,
    valintaTuloksetJulkaistaanHakijoillePaattyy: 1769371212000,
    varasijatayttoPaattyy: 1769471212000,
  },
  hakemuksenTulokset: [],
};

export const defaultMockHakemukset = {
  current: [hakemus1, hakemus2],
  old: [],
};

export const hakemuksenTulosVarasijalla = {
  hakukohdeOid: 'hakukohde-oid-1',
  hakukohdeNimi: 'Meteorologi, Tornadoinen tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-1',
  tarjoajaNimi: 'Hurrikaaniopisto, Hiekkalinnan kampus',
  valintatapajonoOid: '1234',
  valintatila: 'VARALLA',
  varasijanumero: 2,
  vastaanottotila: 'KESKEN',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  vastaanottoDeadline: null,
  viimeisinHakemuksenTilanMuutos: '2025-11-19T15:24:07Z',
  hyvaksyttyJaJulkaistuDate: null,
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: true,
  tilanKuvaukset: {
    FI: '',
    SV: '',
    EN: '',
  },
  showMigriURL: null,
  jonokohtaisetTulostiedot: [
    {
      oid: '1234',
      nimi: '',
      valintatila: 'VARALLA',
      varasijanumero: 2,
      julkaistavissa: true,
      tilanKuvaukset: {
        FI: '',
        SV: '',
        EN: '',
      },
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: null,
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTulosVastaanotettu = {
  hakukohdeOid: 'hakukohde-oid-1',
  hakukohdeNimi: 'Meteorologi, Tornadoinen tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-1',
  tarjoajaNimi: 'Hurrikaaniopisto, Hiekkalinnan kampus',
  valintatapajonoOid: '1234',
  valintatila: 'HYVAKSYTTY',
  vastaanottotila: 'VASTAANOTTANUT_SITOVASTI',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  vastaanottoDeadline: null,
  viimeisinHakemuksenTilanMuutos: '2025-11-19T15:24:07Z',
  hyvaksyttyJaJulkaistuDate: null,
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: '',
    SV: '',
    EN: '',
  },
  showMigriURL: null,
  jonokohtaisetTulostiedot: [
    {
      oid: '1234',
      nimi: '',
      valintatila: 'HYVAKSYTTY',
      julkaistavissa: true,
      tilanKuvaukset: {
        FI: '',
        SV: '',
        EN: '',
      },
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: null,
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTulosKesken = {
  hakukohdeOid: 'hakukohde-oid-2',
  hakukohdeNimi: 'Meteorologi, Hurrikaanien tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-2',
  tarjoajaNimi: 'Hurrikaaniopisto, Myrskynsilmän kampus',
  valintatapajonoOid: '1234',
  valintatila: 'KESKEN',
  vastaanottotila: 'KESKEN',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  vastaanottoDeadline: null,
  viimeisinHakemuksenTilanMuutos: '2025-11-19T15:24:07Z',
  hyvaksyttyJaJulkaistuDate: null,
  julkaistavissa: false,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: '',
    SV: '',
    EN: '',
  },
  showMigriURL: null,
  jonokohtaisetTulostiedot: [
    {
      oid: '1234',
      nimi: '',
      valintatila: 'KESKEN',
      julkaistavissa: false,
      tilanKuvaukset: {
        FI: '',
        SV: '',
        EN: '',
      },
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: null,
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTulosHyvaksytty = {
  hakukohdeOid: 'hakukohde-oid-3',
  hakukohdeNimi: 'Meteorologi, Hyökyaaltojen tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-2',
  tarjoajaNimi: 'Tsunamiopisto, Merenpohjan kampus',
  valintatapajonoOid: '2345',
  valintatila: 'HYVAKSYTTY',
  vastaanottotila: 'KESKEN',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
  vastaanottoDeadline: '2025-12-11T13:00:00Z',
  viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
  hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {},
  showMigriURL: false,
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'HYVAKSYTTY',
      julkaistavissa: true,
      tilanKuvaukset: {},
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: {},
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTulosHylatty = {
  hakukohdeOid: 'hakukohde-oid-3',
  hakukohdeNimi: 'Meteorologi, Hyökyaaltojen tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-2',
  tarjoajaNimi: 'Tsunamiopisto, Merenpohjan kampus',
  valintatapajonoOid: '2345',
  valintatila: 'HYLATTY',
  vastaanottotila: 'KESKEN',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'KESKEN',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  vastaanottoDeadline: null,
  viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
  hyvaksyttyJaJulkaistuDate: null,
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: 'Pohjakoulutus ei ole riittävä',
    SV: 'Pohjakoulutus ei ole riittävä',
    EN: 'Pohjakoulutus ei ole riittävä',
  },
  showMigriURL: false,
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'HYLATTY',
      julkaistavissa: true,
      tilanKuvaukset: {
        FI: 'Pohjakoulutus ei ole riittävä',
        SV: 'Pohjakoulutus ei ole riittävä',
        EN: 'Pohjakoulutus ei ole riittävä',
      },
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: {},
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTulosPeruuntunut = {
  hakukohdeOid: 'hakukohde-oid-3',
  hakukohdeNimi: 'Meteorologi, Hyökyaaltojen tutkimislinja',
  tarjoajaOid: 'tarjoaja-oid-2',
  tarjoajaNimi: 'Tsunamiopisto, Merenpohjan kampus',
  valintatapajonoOid: '2345',
  valintatila: 'PERUUNTUNUT',
  vastaanottotila: 'KESKEN',
  ilmoittautumistila: {
    ilmoittautumisaika: {},
    ilmoittautumistila: 'KESKEN',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  vastaanottoDeadline: null,
  viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
  hyvaksyttyJaJulkaistuDate: null,
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: 'Sait ylemmän hakutoiveen opiskelupaikan',
    SV: 'Sait ylemmän hakutoiveen opiskelupaikan SV',
    EN: 'Sait ylemmän hakutoiveen opiskelupaikan EN',
  },
  showMigriURL: false,
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'PERUUNTUNUT',
      julkaistavissa: true,
      tilanKuvaukset: {
        fi: 'Sait ylemmän hakutoiveen paikan',
        sv: 'Sait ylemmän hakutoiveen paikan',
        en: 'Sait ylemmän hakutoiveen paikan',
      },
      ehdollisestiHyvaksyttavissa: false,
      ehdollisenHyvaksymisenEhto: {},
      eiVarasijatayttoa: false,
      varasijasaannotKaytossa: false,
    },
  ],
};

export const hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty = [
  {
    hakukohdeOid: 'hakukohde-oid-1',
    tarjoajaOid: 'tarjoaja-oid-1',
    tarjoajaNimi: 'Hurrikaaniopisto, Hiekkalinnan kampus',
    valintatapajonoOid: '2344',
    valintatila: 'VARALLA',
    vastaanottotila: 'KESKEN',
    ilmoittautumistila: {
      ilmoittautumisaika: {},
      ilmoittautumistila: 'EI_TEHTY',
      ilmoittauduttavissa: false,
    },
    vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
    vastaanottoDeadline: '2025-12-11T13:00:00Z',
    viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
    hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
    julkaistavissa: true,
    ehdollisestiHyvaksyttavissa: false,
    tilanKuvaukset: {},
    showMigriURL: false,
    jonokohtaisetTulostiedot: [
      {
        oid: '2345',
        nimi: '',
        valintatila: 'VARALLA',
        julkaistavissa: true,
        tilanKuvaukset: {},
        ehdollisestiHyvaksyttavissa: false,
        ehdollisenHyvaksymisenEhto: {},
        eiVarasijatayttoa: false,
        varasijasaannotKaytossa: false,
      },
    ],
  },
  {
    hakukohdeOid: 'hakukohde-oid-2',
    tarjoajaOid: 'tarjoaja-oid-2',
    tarjoajaNimi: 'Hurrikaaniopisto, Myrskynsilmän kampus',
    valintatapajonoOid: '2345',
    valintatila: 'HYVAKSYTTY',
    vastaanottotila: 'EHDOLLISESTI_VASTAANOTTANUT',
    ilmoittautumistila: {
      ilmoittautumisaika: {},
      ilmoittautumistila: 'EI_TEHTY',
      ilmoittauduttavissa: false,
    },
    vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
    vastaanottoDeadline: '2025-12-11T13:00:00Z',
    viimeisinHakemuksenTilanMuutos: '2025-11-27T09:50:18Z',
    hyvaksyttyJaJulkaistuDate: '2025-11-27T10:57:22Z',
    julkaistavissa: true,
    ehdollisestiHyvaksyttavissa: false,
    tilanKuvaukset: {},
    showMigriURL: false,
    jonokohtaisetTulostiedot: [
      {
        oid: '2345',
        nimi: '',
        valintatila: 'HYVAKSYTTY',
        julkaistavissa: true,
        tilanKuvaukset: {},
        ehdollisestiHyvaksyttavissa: false,
        ehdollisenHyvaksymisenEhto: {},
        eiVarasijatayttoa: false,
        varasijasaannotKaytossa: false,
      },
    ],
  },
];

export const hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa =
  (() => {
    const tulokset = clone(hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty);
    if (tulokset[1]) {
      tulokset[1].vastaanotettavuustila = 'VASTAANOTETTAVISSA_EHDOLLISESTI';
      tulokset[1].vastaanottotila = 'KESKEN';
    }
    return tulokset;
  })();

export const hakemuksenTuloksiaYlinHyvaksyttyAlimmatPeruuntuneet = (() => {
  const tulokset = clone(
    hakemus4ToinenAsteAlempiaHyvaksyttyja.hakemuksenTulokset,
  );
  if (tulokset[0] && tulokset[1] && tulokset[2]) {
    tulokset[0].vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA';
    tulokset[0].vastaanottotila = 'VASTAANOTTANUT_SITOVASTI';
    tulokset[1].vastaanottotila = 'PERUNUT';
    tulokset[2].vastaanottotila = 'PERUNUT';
  }
  return tulokset;
})();

export const jonokohtaisetTulostiedot = [
  {
    oid: '1234',
    nimi: 'todistusvalinta',
    valintatila: 'HYLATTY',
    julkaistavissa: true,
    tilanKuvaukset: {
      FI: 'Pisteraja ei ylittynyt',
      SV: 'Pisteraja ei ylittynyt SV',
      EN: 'Pisteraja ei ylittynyt EN',
    },
    pisteet: 30,
    alinHyvaksyttyPistemaara: 40,
    ehdollisestiHyvaksyttavissa: false,
    ehdollisenHyvaksymisenEhto: {},
    eiVarasijatayttoa: false,
    varasijasaannotKaytossa: false,
  },
  {
    oid: '2345',
    nimi: 'paasykoevalinta',
    valintatila: 'HYVAKSYTTY',
    julkaistavissa: true,
    tilanKuvaukset: {},
    pisteet: 50,
    alinHyvaksyttyPistemaara: 45,
    ehdollisestiHyvaksyttavissa: false,
    ehdollisenHyvaksymisenEhto: {},
    eiVarasijatayttoa: false,
    varasijasaannotKaytossa: false,
  },
];

export const jonokohtaisetTulostiedotEhdollinen = [
  {
    oid: '2345',
    nimi: 'paasykoevalinta',
    valintatila: 'HYVAKSYTTY',
    julkaistavissa: true,
    tilanKuvaukset: {},
    pisteet: 50,
    alinHyvaksyttyPistemaara: 45,
    ehdollisestiHyvaksyttavissa: true,
    ehdollisenHyvaksymisenEhto: {},
    eiVarasijatayttoa: false,
    varasijasaannotKaytossa: false,
  },
];

export const jonokohtaisetTulostiedotPeruuntunut = [
  {
    oid: '2345',
    nimi: 'paasykoevalinta',
    valintatila: 'PERUUNTUNUT',
    julkaistavissa: true,
    tilanKuvaukset: {
      FI: 'Olet vastaanottanut toisen opiskelupaikan',
      SV: 'Olet vastaanottanut toisen opiskelupaikan SV',
      EN: 'Olet vastaanottanut toisen opiskelupaikan EN',
    },
    pisteet: 50,
    alinHyvaksyttyPistemaara: 45,
    ehdollisestiHyvaksyttavissa: false,
    ehdollisenHyvaksymisenEhto: {},
    eiVarasijatayttoa: false,
    varasijasaannotKaytossa: false,
  },
];
