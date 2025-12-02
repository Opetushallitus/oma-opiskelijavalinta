import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { defaultMockApplications } from '../mocks';

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

export async function mockApplicationsFetch(
  page: Page,
  applications?: {
    current: Array<Record<string, string | object | boolean | number | null>>;
    old: Array<Record<string, string | object | boolean | number | null>>;
  },
) {
  const applicationsToReturn = JSON.stringify(
    applications ? applications : defaultMockApplications,
  );
  await page.route('**/api/applications', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: applicationsToReturn,
    });
  });
}
