import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';
import { hakemuksenTulosHylatty, hakemuksenTulosHyvaksytty } from './mocks';

test('Näyttää menneitä hakemuksia', async ({ page }) => {
  await setup(page);

  const hakemukset = page.getByTestId('past-hakemukset');

  const app = page.getByTestId('past-application-hakemus-oid-3');
  await expect(app.getByText('Haahuilijoiden Hyväksytyt Haut')).toBeVisible();
  await expect(app.getByText('Samoojakoulutus')).toBeHidden();
  const app2 = page.getByTestId('past-application-hakemus-oid-4');
  await expect(app2.getByText('Haamuilijoiden Hylätyt Haut')).toBeVisible();
  await expect(app2.getByText('Walkoisten lakanoiden pesijät')).toBeHidden();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(0);

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(2);

  await expect(
    page
      .getByTestId('active-hakemukset')
      .getByText('Sinulla ei ole ajankohtaisia opiskelupaikan hakemuksia.', {
        exact: true,
      }),
  ).toBeVisible();
});

test('Avaa ja sulkee menneen hyväksytyn hakemuksen tiedot', async ({
  page,
}) => {
  await setup(page);

  const app = page.getByTestId('past-application-hakemus-oid-3');
  await app
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await expect(
    page.getByText('Samoojakoulutus').filter({ visible: true }),
  ).toHaveCount(2);
  await expect(
    app.getByText('Eräjärvi, Lappi').filter({ visible: true }),
  ).toHaveCount(2);
  await expect(
    app.getByText('Hyväksytty').filter({ visible: true }),
  ).toHaveCount(3);

  await app
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await expect(
    app.getByText('Samoojakoulutus').filter({ visible: true }),
  ).toHaveCount(0);
  await expect(
    app.getByText('Eräjärvi, Lappi').filter({ visible: true }),
  ).toHaveCount(0);
  await expect(
    app.getByText('Hyväksytty').filter({ visible: true }),
  ).toHaveCount(0);
});

test('Avaa ja sulkee hylätyn hakemuksen tiedot', async ({ page }) => {
  await setup(page);

  const app = page.getByTestId('past-application-hakemus-oid-4');
  await app
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await expect(page.getByText('Walkoisten lakanoiden pesijät')).toBeVisible();
  await expect(app.getByText('Wanha Tekstiilitehdas, Fiskars')).toBeVisible();
  await expect(app.getByText('Et saanut tätä opiskelupaikkaa')).toBeVisible();

  await app
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await expect(app.getByText('Walkoisten lakanoiden pesijät')).toBeHidden();
  await expect(app.getByText('Wanha Tekstiilitehdas, Fiskars')).toBeHidden();
  await expect(app.getByText('Et saanut tätä opiskelupaikkaa')).toBeHidden();
});

test('Menneiden hakemusten saavutettavuus', async ({ page }) => {
  await setup(page);
  await expect(page.getByText('Haahuilijoiden Hyväksytyt Haut')).toBeVisible();
  await expectPageAccessibilityOk(page);
  // Testataan saavutettavuus myös haitarit aukinaisina
  await page
    .getByTestId('past-application-hakemus-oid-3')
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await page
    .getByTestId('past-application-hakemus-oid-4')
    .getByRole('button', { name: 'Opiskelijavalintojen tulokset' })
    .click();
  await expect(page.getByText('Wanha Tekstiilitehdas, Fiskars')).toBeVisible();
  await expectPageAccessibilityOk(page);
});

async function setup(page: Page) {
  const application1 = {
    oid: 'hakemus-oid-3',
    secret: 'secret-3',
    haku: {
      oid: 'haku-oid-3',
      nimi: { fi: 'Haahuilijoiden Hyväksytyt Haut' },
      hakuaikaKaynnissa: false,
      viimeisinPaattynytHakuAika: '2024-06-19T09:00:00',
    },
    submitted: '2024-06-18T19:00:00',
    hakukohteet: [
      {
        oid: 'hakukohde-oid-4',
        nimi: { fi: 'Samoojakoulutus' },
        jarjestyspaikkaHierarkiaNimi: {
          fi: 'Eräjärvi, Lappi',
        },
      },
    ],
    ohjausparametrit: {
      hakukierrosPaattyy: 1663971212000,
    },
    hakemuksenTulokset: [],
  };
  const application2 = {
    oid: 'hakemus-oid-4',
    secret: 'secret-4',
    haku: {
      oid: 'haku-oid-4',
      nimi: { fi: 'Haamuilijoiden Hylätyt Haut' },
      hakuaikaKaynnissa: false,
      viimeisinPaattynytHakuAika: '2004-06-19T09:00:00',
    },
    submitted: '2004-06-18T19:00:00',
    hakukohteet: [
      {
        oid: 'hakukohde-oid-5',
        nimi: { fi: 'Walkoisten lakanoiden pesijät' },
        jarjestyspaikkaHierarkiaNimi: {
          fi: 'Wanha Tekstiilitehdas, Fiskars',
        },
      },
    ],
    ohjausparametrit: {
      hakukierrosPaattyy: 1503971212000,
    },
    hakemuksenTulokset: [],
  };
  await mockHakemuksetFetch(page, {
    current: [],
    old: [application1, application2],
  });
  await mockAuthenticatedUser(page);
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-3/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            ...hakemuksenTulosHyvaksytty,
            hakukohdeOid: 'hakukohde-oid-4',
            hakukohdeNimi: 'Samoojakoulutus',
            tarjoajaNimi: 'Eräjärvi, Lappi',
          },
        ]),
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-4/**',
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            ...hakemuksenTulosHylatty,
            hakukohdeOid: 'hakukohde-oid-5',
            hakukohdeNimi: 'Walkoisten lakanoiden pesijät',
            tarjoajaNimi: 'Wanha Tekstiilitehdas, Fiskars',
          },
        ]),
      });
    },
  );
  await page.goto('');
}
