import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';
import { mockSession } from './mocks';

test('Näyttää virhesivun', async ({ page }) => {
  await setup(page);
  await assertVirheSivu(page);
});

test('Lataa sivun uudelleen onnistuneesti', async ({ page }) => {
  await setup(page);
  await assertVirheSivu(page);
  await page.unroute('**/api/session');
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        authMethod: 'link',
      }),
    });
  });
  await mockAuthenticatedUser(page);
  await mockHakemuksetFetch(page, { current: [], old: [] });
  await page.getByRole('button', { name: 'Lataa sivu uudestaan' }).click();
  await expect(
    page.getByText('Hakemukset ja opiskelupaikan vastaanotto'),
  ).toBeVisible();
  await expect(page.getByText('Ruhtinas Nukettaja')).toBeVisible();
});

test('Näyttää virhesivun kun virhe tulee user-rajapinnasta', async ({
  page,
}) => {
  await setup(page, '**/api/user');
  await assertVirheSivu(page);
});

test('Ei näytä virhesivua kun virhe tulee hakemukset-rajapinnasta', async ({
  page,
}) => {
  await mockSession(page);
  await mockAuthenticatedUser(page);
  await page.route('**/api/hakemukset', async (route) => {
    await route.fulfill({ status: 500 });
  });
  await page.goto('');
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeHidden();
  await expect(page.getByText('palvelinvirhe')).toHaveCount(1);
});

test('Näyttää virhesivun /error polulla', async ({ page }) => {
  await page.goto('oma-opiskelijavalinta/error');
  await assertVirheSivu(page);
});

test('Näyttää eri virhesivun /link-error polulla', async ({ page }) => {
  await page.goto('oma-opiskelijavalinta/link-error');
  await expect(page).toHaveTitle('Hakemukset ja opiskelupaikan vastaanotto');
  await expect(
    page.getByRole('heading', { name: 'Latauslinkki ei toimi' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Linkki, jota yritit käyttää, on vanhentunut tai virheellinen.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Oma Opintopolun etusivulle' }),
  ).toBeVisible();
});

test('Virhesivun saavutettavuus', async ({ page }) => {
  await setup(page);
  await assertVirheSivu(page);
  await expectPageAccessibilityOk(page);
});

async function setup(page: Page, api: string = '**/api/session') {
  await page.route(api, async (route) => {
    await route.fulfill({
      status: 500,
    });
  });
  await page.goto('');
}

async function assertVirheSivu(page: Page) {
  await expect(page).toHaveTitle('Hakemukset ja opiskelupaikan vastaanotto');
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeVisible();
  await expect(page.getByText('Tapahtui palvelinvirhe. Lataa')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Lataa sivu uudestaan' }),
  ).toBeVisible();
}
