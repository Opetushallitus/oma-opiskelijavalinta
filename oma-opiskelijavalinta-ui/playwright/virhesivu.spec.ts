import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
  mockHakemuksetFetch,
} from './lib/playwrightUtils';

test('Näyttää virhesivun', async ({ page }) => {
  await setup(page);
  await expect(page).toHaveTitle('Oma Opiskelijavalinta');
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeVisible();
  await expect(page.getByText('Tapahtui palvelinvirhe. Lataa')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Lataa sivu uudestaan' }),
  ).toBeVisible();
});

test('Lataa sivun uudelleen onnistuneesti', async ({ page }) => {
  await setup(page);
  await expect(page.getByText('Tapahtui palvelinvirhe. Lataa')).toBeVisible();
  await page.unroute('**/api/session');
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      body: '',
    });
  });
  await mockAuthenticatedUser(page);
  await mockHakemuksetFetch(page, { current: [], old: [] });
  await page.getByRole('button', { name: 'Lataa sivu uudestaan' }).click();
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expect(page.getByText('Ruhtinas Nukettaja')).toBeVisible();
});

test('Virhesivun saavutettavuus', async ({ page }) => {
  await setup(page);
  await page.goto('');
  await expect(
    page.getByRole('heading', { name: 'Nyt meni jokin pieleen' }),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});

async function setup(page: Page) {
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 500,
    });
  });
  await page.goto('');
}
