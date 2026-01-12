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
import { VastaanottoTila } from '@/lib/valinta-tulos-types';

test('Näyttää jonotustilassa olevan hakutoiveen', async ({ page }) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Hurrikaaniopisto, Myrskynsilm'),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Opiskelupaikka vastaanotettu, jonottaa ylempiä hakutoiveita',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByText(
      'Luovun jonotuksesta ja muutan vastaanoton sitovaksi',
    ),
  ).toBeVisible();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Näyttää virheen lähettäessä vastausta ilman valintaa', async ({
  page,
}) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await expect(
    vastaanotot.getByText('Pakollinen tieto. Valitse yksi vaihtoehto.'),
  ).toBeHidden();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(vastaanotot.getByText('Pakollinen tieto.')).toBeVisible();
});

test('Näyttää peruutettavan vahvistusdialogin lähetettäessä vastaanottoa', async ({
  page,
}) => {
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await vastaanotot
    .getByRole('checkbox', { name: 'Luovun jonotuksesta ja muutan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    page.getByText('Vahvista jonotuksesta luopuminen'),
  ).toBeVisible();
  await expect(
    page
      .getByLabel('Vahvista jonotuksesta')
      .getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    page
      .getByLabel('Vahvista jonotuksesta')
      .getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Peruuta' }).click();
  await expect(page.getByText('Vahvista jonotuksesta luopuminen')).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeVisible();
});

test('Lähettää vastaanoton onnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 200,
      });
    },
  );
  await page.route(
    '**/api/valintatulos/hakemus/hakemus-oid-1/**',
    async (route) => {
      const tulos = hakemuksenTuloksiaYlempiVarallaAlempiHyvaksytty;
      if (tulos[1]) {
        tulos[1].vastaanotettavuustila = 'EI_VASTAANOTETTAVISSA';
        tulos[1].vastaanottotila = VastaanottoTila.VASTAANOTTANUT_SITOVASTI;
      }
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tulos),
      });
    },
  );
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await vastaanotot
    .getByRole('checkbox', { name: 'Luovun jonotuksesta ja muutan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page.getByRole('button', { name: 'Luovu jonotuksesta' }).click();
  //ilmoitus näkyy ja suljetaan se
  await expect(page.getByText('Varasijan jonotuksesta luovutt')).toBeVisible();
  await page.getByRole('button', { name: 'Sulje' }).click();
  await expect(page.getByText('Varasijan jonotuksesta luovutt')).toBeHidden();
  await expect(
    vastaanotot.getByRole('button', { name: 'Lähetä vastaus' }),
  ).toBeHidden();
  await expect(
    vastaanotot.getByText('Opiskelupaikka vastaanotettu', { exact: true }),
  ).toBeVisible();
});

test('Lähettää vastaanoton epäonnistuneesti', async ({ page }) => {
  await page.route(
    '**/api/vastaanotto/hakemus/hakemus-oid-1/**',
    async (route) => {
      await route.fulfill({
        status: 500,
      });
    },
  );
  await setup(page);
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await vastaanotot
    .getByRole('checkbox', { name: 'Luovun jonotuksesta ja muutan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await page.getByRole('button', { name: 'Luovu jonotuksesta' }).click();
  await expect(page.getByText('Vastaanottotoiminto epäonnistui')).toBeVisible();
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

test('Sitova vastaanottomodaali on saavutettava', async ({ page }) => {
  await setup(page);

  await page.addStyleTag({
    content: '* {animation: none !important; transition: none !important; }',
  });

  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-1');
  await vastaanotot
    .getByRole('checkbox', { name: 'Luovun jonotuksesta ja muutan' })
    .click();
  const sendButton = vastaanotot.getByRole('button', {
    name: 'Lähetä vastaus',
  });
  await sendButton.click();
  await expect(
    page.getByText('Vahvista jonotuksesta luopuminen'),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Peruuta' })).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Luovu jonotuksesta' }),
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
