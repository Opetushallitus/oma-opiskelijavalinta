import { expect, test } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockHakemuksetFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';

test('Näyttää käyttäjän hakemukset', async ({ page }) => {
  await mockHakemuksetFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  const activehakemukset = page.getByTestId('active-hakemukset');

  const app1 = page.getByTestId('application-hakemus-oid-1');
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
    activehakemukset.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(3);

  await expect(
    activehakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(2);
});

test('Näyttää ei hakemuksia tekstin kun käyttäjällä ei ole hakemuksia', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, { current: [], old: [] });
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
  await mockHakemuksetFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('past-hakemukset');

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
    hakemukset.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(0);

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
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
  await mockHakemuksetFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('past-hakemukset');

  const app = page.getByTestId('application-hakemus-oid-07');
  await expect(app.getByText('Hajuton hakemus')).toBeVisible();
  await expect(app.getByText('Hakutoiveesi')).toBeHidden();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);
});

test('Hakemusten saavutettavuus', async ({ page }) => {
  await mockHakemuksetFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page.getByText('Hurrikaaniopiston jatkuva haku 2025'),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});
