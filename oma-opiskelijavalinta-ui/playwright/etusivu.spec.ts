import { expect, test } from '@playwright/test';
import { expectPageAccessibilityOk } from './lib/playwrightUtils';

const APP_URL = 'http://localhost:3777/oma-opiskelijavalinta';

test('Näyttää etusivun infoineen', async ({ page }) => {
  // Mock authenticated user
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Test User',
        personOid: '1.2.246.562.24.00000000001',
      }),
    });
  });
  await page.goto(APP_URL);
  await expect(page).toHaveTitle('Oma Opiskelijavalinta');
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expect(page.getByText('Test User')).toBeVisible();
  await expect(page.getByText('1.2.246.562.24.00000000001')).toBeVisible();
  await expect(
    page.getByText('Muokkaa hakemustasi ja seuraa valinnan etenemistä'),
  ).toBeVisible();
  await expect(
    page.getByText('tarkastella hakemuksiasi ja muokata niitä hakuaikana'),
  ).toBeVisible();
  await expect(
    page.getByText('lisätä liitteitä hakemuksellesi määräaikaan mennessä'),
  ).toBeVisible();
  await expect(
    page.getByText('nähdä opiskelijavalinnan tulokset'),
  ).toBeVisible();
  await expect(page.getByText('ottaa opiskelupaikan vastaan')).toBeVisible();
});

test('Etusivun saavutettavuus', async ({ page }) => {
  // Mock authenticated user
  await page.route('**/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Test User',
        personOid: '1.2.246.562.24.00000000001',
      }),
    });
  });
  await page.goto('');
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expectPageAccessibilityOk(page);
});
