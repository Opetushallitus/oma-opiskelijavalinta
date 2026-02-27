import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';

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
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
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
  await setup(page, '**/api/hakemukset');
  await expect(page.getByText('Tapahtui palvelinvirhe. Lataa')).toBeHidden();
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeHidden();
  await expect(page.getByText('Palvelinvirhe')).toHaveCount(2);
});

test('Virhesivun saavutettavuus', async ({ page }) => {
  await setup(page);
  await page.goto('');
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
  await expect(page).toHaveTitle('Oma Opiskelijavalinta');
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeVisible();
  await expect(page.getByText('Tapahtui palvelinvirhe. Lataa')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Lataa sivu uudestaan' }),
  ).toBeVisible();
}
