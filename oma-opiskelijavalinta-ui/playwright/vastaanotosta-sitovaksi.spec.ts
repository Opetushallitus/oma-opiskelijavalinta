import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty,
  hakemus1,
} from './mocks';

test('Näyttää jonotustilassa olevan hakutoiveen', async ({ page }) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Hurrikaaniopisto, Myrskynsilm'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hyväksytty')).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Luovun jonotuksesta ja muutan vastaanoton sitovaksi',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Sitova vastaanotto on saavutettava', async ({ page }) => {
  await setup(page);

  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Hurrikaaniopisto, Myrskynsilm'),
  ).toBeVisible();

  await expectPageAccessibilityOk(page);
});

async function setup(page: Page) {
  await mockApplicationsFetch(page, {
    current: [
      {
        ...hakemus1,
        hakemuksenTulokset: hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty,
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
}
