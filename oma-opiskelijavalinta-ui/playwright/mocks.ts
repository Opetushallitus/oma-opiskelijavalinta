import { clone } from 'remeda';
import type { Page } from '@playwright/test';
import type {
  HakemuksetResponse,
  HakemusResponse,
} from '@/lib/hakemus-service';
import {
  VastaanottoTila,
  type HakutoiveenTulosDto,
} from '@/lib/valinta-tulos-types';
import type { Haku } from '@/lib/kouta-types';

export const mockSession = async (page: Page) => {
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authMethod: 'cas',
      }),
    });
  });
};

export const hakemus1: HakemusResponse = {
  oid: 'hakemus-oid-1',
  secret: 'secret-1',
  haku: {
    oid: 'haku-oid-1',
    nimi: { fi: 'Hurrikaaniopiston erillishaku 2025' },
    hakuaikaKaynnissa: true,
    viimeisinPaattynytHakuAika: 1760868000000,
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
      uudenOpiskelijanUrl: {
        fi: 'linkkioppilaitokseen.fi',
        en: 'linktostudyplace.fi',
      },
      yhdenPaikanSaanto: { voimassa: false },
    },
    {
      oid: 'hakukohde-oid-2',
      nimi: { fi: 'Meteorologi, Hurrikaanien tutkimislinja' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Hurrikaaniopisto, Myrskynsilmän kampus',
      },
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: { voimassa: false },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763471212000,
    jarjestetytHakutoiveet: true,
    valintaTuloksetJulkaistaanHakijoilleAlkaa: 1779271212000,
    varasijatayttoPaattyy: 1779471212000,
  },
  hakemuksenTulokset: [],
  processing: false,
  formName: {
    fi: 'Hurrikaaniopiston lomake',
    en: undefined,
    sv: undefined,
  },
  tuloskirjeModified: null,
};

export const hakemus2: HakemusResponse = {
  oid: 'hakemus-oid-2',
  secret: 'secret-2',
  haku: {
    oid: 'haku-oid-2',
    nimi: { fi: 'Tsunamiopiston tohtoritutkinnon haku 2025' },
    hakuaikaKaynnissa: false,
    viimeisinPaattynytHakuAika: 1750312800000,
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
      yhdenPaikanSaanto: { voimassa: true },
      uudenOpiskelijanUrl: null,
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763971212000,
  },
  hakemuksenTulokset: [],
  processing: false,
  formName: {
    fi: 'Tsunamiopiston lomake',
    en: undefined,
    sv: undefined,
  },
  tuloskirjeModified: null,
};

export const TOISEN_ASTEEN_YHTEISHAKU: Haku = {
  oid: 'haku-oid-3',
  nimi: { fi: 'Toisten asteen yhteishaku 2024' },
  hakuaikaKaynnissa: false,
  viimeisinPaattynytHakuAika: 1750312800000,
  hakutapaKoodiUri: 'hakutapa_01',
  kohdejoukkoKoodiUri: 'haunkohdejoukko_11',
};

export const JATKUVA_HAKU: Haku = {
  oid: 'haku-oid-4',
  nimi: { fi: 'Rötkönperän jatkuva haku' },
  hakuaikaKaynnissa: true,
  hakutapaKoodiUri: 'hakutapa_03',
  kohdejoukkoKoodiUri: 'haunkohdejoukko_23',
};

export const hakemus3ToinenAste: HakemusResponse = {
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
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: {
        voimassa: false,
      },
    },
  ],
  ohjausparametrit: {
    hakukierrosPaattyy: 1763971212000,
  },
  hakemuksenTulokset: [
    {
      hakukohdeOid: 'hakukohde-oid-4',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2349',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
  ],
  processing: false,
  formName: {
    fi: 'Toisen asteen yhteishaun lomake',
    en: undefined,
    sv: undefined,
  },
  tuloskirjeModified: null,
};

export const hakemus4ToinenAsteAlempiaHyvaksyttyja: HakemusResponse = {
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
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: {
        voimassa: false,
      },
    },
    {
      oid: 'hakukohde-oid-5',
      nimi: { fi: 'Ajoneuvoalan perustutkinto' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Romuttamo, Romujenkerääjät RY',
      },
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: {
        voimassa: false,
      },
    },
    {
      oid: 'hakukohde-oid-6',
      nimi: { fi: 'Putkimiehen perustutkinto' },
      jarjestyspaikkaHierarkiaNimi: {
        fi: 'Putkittamo, Putket Vuotaa OY',
      },
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: {
        voimassa: false,
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
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2349',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
    {
      hakukohdeOid: 'hakukohde-oid-5',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2358',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
    {
      hakukohdeOid: 'hakukohde-oid-6',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2359',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
  ],
  processing: false,
  formName: {
    fi: undefined,
    en: undefined,
    sv: undefined,
  },
  tuloskirjeModified: null,
};

export const hakemus5JatkuvaHaku: HakemusResponse = {
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
      uudenOpiskelijanUrl: null,
      yhdenPaikanSaanto: {
        voimassa: false,
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
  formName: {
    fi: 'Lötkölomake',
    en: undefined,
    sv: undefined,
  },
  tuloskirjeModified: null,
};

export const defaultMockHakemukset: HakemuksetResponse = {
  current: [hakemus1, hakemus2],
  old: [],
};

export const hakemuksenTulosVarasijalla: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-1',
  valintatila: 'VARALLA',
  varasijanumero: 2,
  vastaanottotila: VastaanottoTila.KESKEN,
  ilmoittautumistila: {
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: true,
  tilanKuvaukset: {
    FI: '',
    SV: '',
    EN: '',
  },
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
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosVastaanotettu: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-1',
  valintatila: 'HYVAKSYTTY',
  vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  ilmoittautumistila: {
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: '',
    SV: '',
    EN: '',
  },
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
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosHyvaksytty: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-3',
  valintatila: 'HYVAKSYTTY',
  vastaanottotila: VastaanottoTila.KESKEN,
  ilmoittautumistila: {
    ilmoittautumistila: 'EI_TEHTY',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
  vastaanottoDeadline: '2025-12-11T13:00:00Z',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'HYVAKSYTTY',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosHylatty: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-3',
  valintatila: 'HYLATTY',
  vastaanottotila: VastaanottoTila.KESKEN,
  ilmoittautumistila: {
    ilmoittautumistila: 'KESKEN',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: 'Pohjakoulutus ei ole riittävä',
    SV: 'Pohjakoulutus ei ole riittävä',
    EN: 'Pohjakoulutus ei ole riittävä',
  },
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
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosPeruuntunut: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-3',
  valintatila: 'PERUUNTUNUT',
  vastaanottotila: VastaanottoTila.KESKEN,
  ilmoittautumistila: {
    ilmoittautumistila: 'KESKEN',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  julkaistavissa: true,
  ehdollisestiHyvaksyttavissa: false,
  tilanKuvaukset: {
    FI: 'Sait ylemmän hakutoiveen opiskelupaikan',
    SV: 'Sait ylemmän hakutoiveen opiskelupaikan SV',
    EN: 'Sait ylemmän hakutoiveen opiskelupaikan EN',
  },
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'PERUUNTUNUT',
      julkaistavissa: true,
      tilanKuvaukset: {
        FI: 'Sait ylemmän hakutoiveen paikan',
        SV: 'Sait ylemmän hakutoiveen paikan',
        EN: 'Sait ylemmän hakutoiveen paikan',
      },
      ehdollisestiHyvaksyttavissa: false,
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosPeruuntunutEiKuvausta: HakutoiveenTulosDto = {
  hakukohdeOid: 'hakukohde-oid-3',
  valintatila: 'PERUUNTUNUT',
  vastaanottotila: VastaanottoTila.KESKEN,
  ilmoittautumistila: {
    ilmoittautumistila: 'KESKEN',
    ilmoittauduttavissa: false,
  },
  vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
  julkaistavissa: false,
  ehdollisestiHyvaksyttavissa: false,
  jonokohtaisetTulostiedot: [
    {
      oid: '2345',
      nimi: '',
      valintatila: 'PERUUNTUNUT',
      julkaistavissa: false,
      ehdollisestiHyvaksyttavissa: false,
    },
  ],
  ilmoittautumisenAikaleima: null,
  kelaURL: null,
};

export const hakemuksenTulosHyvaksyttyVastaanottoPerunut: HakutoiveenTulosDto =
  {
    hakukohdeOid: 'hakukohde-oid-3',
    valintatila: 'HYVAKSYTTY',
    vastaanottotila: VastaanottoTila.PERUNUT,
    ilmoittautumistila: {
      ilmoittautumistila: 'KESKEN',
      ilmoittauduttavissa: false,
    },
    vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
    julkaistavissa: true,
    ehdollisestiHyvaksyttavissa: false,
    tilanKuvaukset: {
      FI: 'Sait ylemmän hakutoiveen opiskelupaikan',
      SV: 'Sait ylemmän hakutoiveen opiskelupaikan SV',
      EN: 'Sait ylemmän hakutoiveen opiskelupaikan EN',
    },
    jonokohtaisetTulostiedot: [
      {
        oid: '2345',
        nimi: '',
        valintatila: 'HYVAKSYTTY',
        julkaistavissa: true,
        ehdollisestiHyvaksyttavissa: false,
      },
    ],
    ilmoittautumisenAikaleima: null,
    kelaURL: null,
  };

export const hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty: Array<HakutoiveenTulosDto> =
  [
    {
      hakukohdeOid: 'hakukohde-oid-1',
      valintatila: 'VARALLA',
      vastaanottotila: VastaanottoTila.KESKEN,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2345',
          nimi: '',
          valintatila: 'VARALLA',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
    {
      hakukohdeOid: 'hakukohde-oid-2',
      valintatila: 'HYVAKSYTTY',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
      ilmoittautumistila: {
        ilmoittautumistila: 'EI_TEHTY',
        ilmoittauduttavissa: false,
      },
      vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      vastaanottoDeadline: '2025-12-11T13:00:00Z',
      julkaistavissa: true,
      ehdollisestiHyvaksyttavissa: false,
      jonokohtaisetTulostiedot: [
        {
          oid: '2345',
          nimi: '',
          valintatila: 'HYVAKSYTTY',
          julkaistavissa: true,
          ehdollisestiHyvaksyttavissa: false,
        },
      ],
      ilmoittautumisenAikaleima: null,
      kelaURL: null,
    },
  ];

export const hakemuksenTuloksiaYlempiVarallaAlempiEhdollisestiVastaanotettavissa =
  (() => {
    const tulokset = clone(hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty);
    if (tulokset[1]) {
      tulokset[1].vastaanotettavuustila = 'VASTAANOTETTAVISSA_EHDOLLISESTI';
      tulokset[1].vastaanottotila = VastaanottoTila.KESKEN;
    }
    return tulokset;
  })();

export const hakemuksenTuloksiaYlinHyvaksyttyAlimmatPeruuntuneet = (() => {
  const tulokset = clone(
    hakemus4ToinenAsteAlempiaHyvaksyttyja.hakemuksenTulokset,
  );
  if (tulokset[0] && tulokset[1] && tulokset[2]) {
    tulokset[0].vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA';
    tulokset[0].vastaanottotila = VastaanottoTila.VASTAANOTTANUT_SITOVASTI;
    tulokset[1].vastaanottotila = VastaanottoTila.PERUNUT;
    tulokset[2].vastaanottotila = VastaanottoTila.PERUNUT;
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

export const jonokohtaisetTulostiedotHarkinnanvarainen = [
  {
    oid: '2345',
    nimi: 'paasykoevalinta',
    valintatila: 'HARKINNANVARAISESTI_HYVAKSYTTY',
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
