import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';

test('Näyttää käyttäjän hakemukset', async ({ page }) => {
  await mockApplicationsFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  const activeApplications = page.getByTestId('active-applications');

  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Hurrikaaniopiston jatkuva haku 2025'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Olet 2. varasijalla')).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
  await expect(app1.getByText('Hyväksytty')).toBeVisible();
  await expect(
    app1.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 19.10.2025 klo 13:00 asti.',
    ),
  ).toBeVisible();
  await expect(
    app1.getByText('Hakuaika päättyy 19.10.2025 klo 13:00.'),
  ).toBeVisible();
  await expect(app1.getByText('1', { exact: true })).toBeVisible();
  await expect(app1.getByText('2', { exact: true })).toBeVisible();

  const app2 = page.getByTestId('application-hakemus-oid-2');
  await expect(
    app2.getByText('Tsunamiopiston tohtoritutkinnon haku 2025'),
  ).toBeVisible();
  await expect(
    app2.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app2.getByText('Tsunamiopisto, Merenpohjan kampus'),
  ).toBeVisible();
  await expect(
    app2.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 19.6.2025 klo 09:00 asti.',
    ),
  ).toBeVisible();
  await expect(
    app2.getByText(
      'Opiskelijavalinta on kesken. Hakuaika päättyi 19.6.2025 klo 09:00.',
    ),
  ).toBeVisible();
  await expect(app2.getByText('1', { exact: true })).toBeHidden();

  await expect(
    activeApplications.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(3);

  await expect(
    activeApplications.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(2);
});

test('Näyttää ei hakemuksia tekstin kun käyttäjällä ei ole hakemuksia', async ({
  page,
}) => {
  await mockApplicationsFetch(page, { current: [], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page.getByText('Sinulla ei ole ajankohtaisia opiskelupaikan hakemuksia.'),
  ).toBeVisible();
  await expect(
    page.getByText('Sinulla ei ole aiempia hakemuksia'),
  ).toBeVisible();
});

test('Näyttää menneitä hakemuksia', async ({ page }) => {
  const oldApplication = {
    oid: 'hakemus-oid-3',
    secret: 'secret-3',
    haku: {
      oid: 'haku-oid-3',
      nimi: { fi: 'Tsunamiopiston tohtoritutkinnon haku 2024' },
      hakuaikaKaynnissa: false,
      viimeisinPaattynytHakuAika: '2024-06-19T09:00:00',
    },
    submitted: '2024-06-18T19:00:00',
    hakukohteet: [
      {
        oid: 'hakukohde-oid-4',
        nimi: { fi: 'Meteorologi, Hyökyaaltojen tutkimislinja' },
        jarjestyspaikkaHierarkiaNimi: {
          fi: 'Tsunamiopisto, Merenpohjan kampus',
        },
      },
    ],
    ohjausparametrit: {
      hakukierrosPaattyy: 1663971212000,
    },
    hakutoiveenTulokset: [],
  };
  await mockApplicationsFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const applications = page.getByTestId('past-applications');

  const app = page.getByTestId('past-application-hakemus-oid-3');
  await expect(
    app.getByText('Tsunamiopiston tohtoritutkinnon haku 2024'),
  ).toBeVisible();
  await expect(
    app.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app.getByText('Tsunamiopisto, Merenpohjan kampus'),
  ).toBeVisible();
  await expect(
    app.getByText('Voit muokata hakemustasi hakuajan päättymiseen'),
  ).toBeHidden();
  await expect(app.getByText('Opiskelijavalinta on kesken')).toBeHidden();
  await expect(
    app.getByText('Kaikkien hakutoiveidesi valintatulokset on julkaistu.'),
  ).toBeVisible();

  await expect(
    applications.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(0);

  await expect(
    applications.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);

  await expect(
    applications.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);
});

test('Näyttää hauttoman hakemuksen', async ({ page }) => {
  const oldApplication = {
    oid: 'hakemus-oid-07',
    secret: 'secret-07',
    haku: null,
    formName: {
      fi: 'Hajuton hakemus',
    },
    submitted: '2024-06-18T19:00:00',
    hakukohteet: [],
    ohjausparametrit: null,
  };
  await mockApplicationsFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const applications = page.getByTestId('past-applications');

  const app = page.getByTestId('application-hakemus-oid-07');
  await expect(app.getByText('Hajuton hakemus')).toBeVisible();
  await expect(app.getByText('Hakutoiveesi')).toBeHidden();

  await expect(
    applications.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);
});

test('Hakemusten saavutettavuus', async ({ page }) => {
  await mockApplicationsFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page.getByText('Hurrikaaniopiston jatkuva haku 2025'),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});

async function mockApplicationsFetch(
  page: Page,
  applications?: {
    current: Array<Record<string, string | object | boolean | number | null>>;
    old: Array<Record<string, string | object | boolean | number | null>>;
  },
) {
  const applicationsToReturn = JSON.stringify(
    applications
      ? applications
      : {
          current: [
            {
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
            },
            {
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
              hakemuksenTulokset: [
                {
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
                },
                {
                  hakukohdeOid: 'hakukohde-oid-2',
                  hakukohdeNimi: 'Meteorologi, Hurrikaanien tutkimislinja',
                  tarjoajaOid: 'tarjoaja-oid-2',
                  tarjoajaNimi: 'Hurrikaaniopisto, Myrskynsilmän kampus',
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
                },
              ],
            },
          ],
          old: [],
        },
  );
  await page.route('**/api/applications', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: applicationsToReturn,
    });
  });
}
