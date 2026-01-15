import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { defaultMockHakemukset } from '../mocks';

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

export async function mockHakemuksetFetch(
  page: Page,
  hakemukset?: {
    current: Array<Record<string, string | object | boolean | number | null>>;
    old: Array<Record<string, string | object | boolean | number | null>>;
  },
) {
  const hakemuksetToReturn = JSON.stringify(
    hakemukset ? hakemukset : defaultMockHakemukset,
  );
  await page.route('**/api/hakemukset', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: hakemuksetToReturn,
    });
  });
}
