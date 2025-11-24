import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';

test('Näyttää käyttäjän hakemukset', async ({ page }) => {
  await mockApplicationsFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  const applications = page.getByTestId('active-applications');
  const app1 = applications.first();
  await expect(
    app1.getByText('Hurrikaaniopiston jatkuva haku 2025'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
  await expect(
    app1.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 19.10.2025 klo 13:00 asti.',
    ),
  ).toBeVisible();
  await expect(
    applications.getByText('Hakuaika päättyy 19.10.2025 klo 13:00.'),
  ).toBeVisible();

  const app2 = applications.last();
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

  await expect(
    applications.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(3);

  await expect(
    applications.getByRole('link', { name: 'Muokkaa hakemusta' }),
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
  };
  await mockApplicationsFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const applications = page.getByTestId('past-applications');

  const app = applications.first();
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
    current: Array<Record<string, string | object | boolean | number>>;
    old: Array<Record<string, string | object | boolean | number>>;
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
              },
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
