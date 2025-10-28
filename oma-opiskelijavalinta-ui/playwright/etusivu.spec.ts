import { expect, test } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';

test('Näyttää etusivun infoineen', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(page).toHaveTitle('Oma Opiskelijavalinta');
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expect(page.getByText('Ruhtinas Nukettaja')).toBeVisible();
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
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(page.getByText('Oma Opiskelijavalinta')).toBeVisible();
  await expectPageAccessibilityOk(page);
});
