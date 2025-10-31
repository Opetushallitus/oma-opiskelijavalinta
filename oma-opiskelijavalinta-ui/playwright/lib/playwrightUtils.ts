import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
};

export const mockAuthenticatedUser = async (page: Page) => {
  await page.route('**/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kutsumanimi: 'Ruhtinas',
        sukunimi: 'Nukettaja',
        oppijanumero: '1.2.246.562.24.00000000001',
      }),
    });
  });
};
