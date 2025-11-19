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
  await expect(
    applications.getByText('Hurrikaaniopiston jatkuva haku 2025'),
  ).toBeVisible();
  await expect(
    applications.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(
    applications.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    applications.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    applications.getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
  await expect(
    applications.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 18.11.2025 klo 15:06 asti.',
    ),
  ).toBeVisible();

  await expect(
    applications.getByText('Tsunamiopiston tohtoritutkinnon haku 2025'),
  ).toBeVisible();
  await expect(
    applications.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    applications.getByText('Tsunamiopisto, Merenpohjan kampus'),
  ).toBeVisible();
  await expect(
    applications.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 24.11.2025 klo 10:00 asti.',
    ),
  ).toBeVisible();

  await expect(
    applications.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(3);

  await expect(
    applications.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(2);
});

test('Näyttää ei hakemuksia testin kun käyttäjällä ei ole hakemuksia', async ({
  page,
}) => {
  await mockApplicationsFetch(page, []);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(page.getByText('Ei hakemuksia')).toBeVisible();
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

async function mockApplicationsFetch(page: Page, applications?: []) {
  const applicationsToReturn = JSON.stringify(
    applications
      ? applications
      : [
          {
            oid: 'hakemus-oid-1',
            secret: 'secret-1',
            haku: {
              oid: 'haku-oid-1',
              nimi: { fi: 'Hurrikaaniopiston jatkuva haku 2025' },
            },
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
          {
            oid: 'hakemus-oid-2',
            secret: 'secret-2',
            haku: {
              oid: 'haku-oid-2',
              nimi: { fi: 'Tsunamiopiston tohtoritutkinnon haku 2025' },
            },
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
        ],
  );
  await page.route('**/api/applications', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: applicationsToReturn,
    });
  });
}
