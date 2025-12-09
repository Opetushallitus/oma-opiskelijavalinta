import { expect, test, type Page } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import { hakemuksenTulosHyvaksytty, hakemus2 } from './mocks';

test('Näyttää vastaanotettavan hakutoiveen', async ({ page }) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(vastaanotot.getByText('Hyväksytty')).toBeVisible();
  await expect(
    vastaanotot.getByText('Otan tämän opiskelupaikan'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText('En ota tätä opiskelupaikkaa'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Näyttää virheen lähettäessä vastausta ilman vastaanoton valintaa', async ({
  page,
}) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Pakollinen tieto. Valitse yksi vaihtoehto.'),
  ).toBeHidden();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    vastaanotot.getByText('Pakollinen tieto. Valitse yksi vaihtoehto.'),
  ).toBeVisible();
});

test('Vastaanotto on saavutettava', async ({ page }) => {
  await setup(page);

  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-2');
  await expect(
    vastaanotot.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();

  await expectPageAccessibilityOk(page);
});

async function setup(page: Page) {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
}
