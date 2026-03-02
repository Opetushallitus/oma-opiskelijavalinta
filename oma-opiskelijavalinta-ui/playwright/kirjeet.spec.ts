import { expect, test } from '@playwright/test';
import {
  mockHakemuksetFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import { hakemuksenTulosHyvaksytty, hakemus2 } from './mocks';

test('Näyttää linkin tuloskirjeeseen', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus2,
        tuloskirjeModified: 1721471212000,
        hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  await expect(
    hakemukset.getByRole('link', { name: 'Tuloskirje 20.7.2024' }),
  ).toBeVisible();
});

test('Näyttää linkin menneen hakemuksen tuloskirjeeseen', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [],
    old: [
      {
        ...hakemus2,
        tuloskirjeModified: 1711471212000,
        hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
      },
    ],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('past-hakemukset');

  await expect(
    hakemukset.getByRole('link', { name: 'Tuloskirje 26.3.2024' }),
  ).toBeVisible();
});
