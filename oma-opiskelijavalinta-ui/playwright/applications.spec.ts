import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';

test('Näyttää käyttäjän hakemukset', async ({ page }) => {
  await mockApplicationsFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  const applications = page.getByTestId('active-applications');
  await expect(applications.getByText('haku-1')).toBeVisible();
  await expect(applications.getByText('hk-1')).toBeVisible();
  await expect(applications.getByText('hk-2')).toBeVisible();
  await expect(applications.getByText('haku-1')).toBeVisible();
  await expect(applications.getByText('hk-3')).toBeVisible();
});

test('Näyttää ei hakemuksia testin kun käyttäjällä ei ole hakemuksia', async ({
  page,
}) => {
  await mockApplicationsFetch(page, []);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(page.getByText('Ei hakemuksia')).toBeVisible();
});

test('Hakemusten saavutettavuus', async ({ page }) => {
  await mockApplicationsFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(page.getByText('haku-1')).toBeVisible();
  await expectPageAccessibilityOk(page);
});

async function mockApplicationsFetch(page: Page, applications?: []) {
  const applicationsToReturn = JSON.stringify(
    applications
      ? applications
      : [
          {
            haku: 'haku-1',
            hakukohteet: ['hk-1', 'hk-2'],
          },
          {
            haku: 'haku-2',
            hakukohteet: ['hk-3'],
          },
        ],
  );
  await page.route('**/api/application', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: applicationsToReturn,
    });
  });
}
