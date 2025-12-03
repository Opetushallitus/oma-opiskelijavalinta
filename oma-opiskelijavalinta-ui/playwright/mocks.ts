export const hakemus1 = {
  oid: 'hakemus-oid-1',
  secret: 'secret-1',
  haku: {
    oid: 'haku-oid-1',
    nimi: { fi: 'Hurrikaaniopiston jatkuva haku 2025' },
    hakuaikaKaynnissa: true,
    viimeisinPaattynytHakuAika: '2025-10-19T13:00:00',
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

export const defaultMockApplications = {
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
