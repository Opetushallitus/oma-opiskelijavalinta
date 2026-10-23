import { expect, test } from '@playwright/test';
import {
  expectPageAccessibilityOk,
  mockHakemuksetFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosHyvaksytty,
  hakemuksenTulosPeruuntunut,
  hakemuksenTulosVarasijalla,
  hakemuksenTulosVastaanotettu,
  hakemus1,
  hakemus2,
  hakemus5JatkuvaHaku,
  mockSession,
} from './mocks';

test('Näyttää käyttäjän ajankohtaiset hakemukset', async ({ page }) => {
  await mockHakemuksetFetch(page);
  await mockAuthenticatedUser(page);
  await mockSession(page);
  await page.goto('');
  const activehakemukset = page.getByTestId('active-hakemukset');

  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Hurrikaaniopiston erillishaku 2025'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
  await expect(
    app1.getByText(
      'Voit muokata hakemustasi hakuajan päättymiseen 19.10.2025 klo 13:00 asti.',
    ),
  ).toBeVisible();
  await expect(
    app1.getByText('Hakuaika päättyy 19.10.2025 klo 13:00.'),
  ).toBeVisible();
  await expect(app1.getByText('1', { exact: true })).toBeVisible();
  await expect(app1.getByText('2', { exact: true })).toBeVisible();

  const app2 = page.getByTestId('application-hakemus-oid-2');
  await expect(
    app2.getByText('Tsunamiopiston tohtoritutkinnon haku 2025'),
  ).toBeVisible();
  await expect(
    app2.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app2.getByText('Tsunamiopisto, Merenpohjan kampus'),
  ).toBeVisible();
  await expect(
    app2.getByText('Voit muokata hakemustasi hakuajan päättymiseen'),
  ).toBeHidden();
  await expect(
    app2.getByText(
      'Opiskelijavalinta on kesken. Hakuaika päättyi 19.6.2025 klo 09:00.',
    ),
  ).toBeVisible();
  await expect(app2.getByText('1', { exact: true })).toBeHidden();

  await expect(
    activehakemukset.getByRole('link', { name: 'Näytä valintaperusteet' }),
  ).toHaveCount(3);

  await expect(
    activehakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(1);

  await expect(
    activehakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);

  await expect(
    activehakemukset.getByRole('link', {
      name: 'Siirry Kelan asiointipalveluun',
    }),
  ).toHaveCount(0);

  await expect(
    activehakemukset.getByRole('link', { name: 'Hae oleskelulupaa' }),
  ).toHaveCount(0);

  await expect(
    page
      .getByTestId('past-hakemukset')
      .getByText('Sinulla ei ole aiempia hakemuksia.', { exact: true }),
  ).toBeVisible();
});

test('Näyttää käyttäjän hakemukset joiden tulokset ovat osittain valmiit', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        haku: { ...hakemus1.haku, hakuaikaKaynnissa: false },
        hakemuksenTulokset: [hakemuksenTulosVarasijalla],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');
  const app = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app.getByText('Hurrikaaniopiston erillishaku 2025'),
  ).toBeVisible();
  await expect(
    app.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app.getByText(
      'Olet täyttänyt hakemuksen. Voit muokata hakemustasi alla olevan painikkeen kautta',
    ),
  ).toBeHidden();
  await expect(
    app.getByText('Hakuaika on päättynyt. Tällä hetkellä'),
  ).toBeVisible();
  await expect(
    app.getByText('Valintojen tulokset julkaistaan hakijoille 20.5.2026.'),
  ).toBeVisible();
  await expect(
    app.getByText('Varasijoilta valitseminen päättyy 22.5.2026'),
  ).toBeVisible();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);
});

test('Ei näytä infoa hakuajan päättymisestä jos ei ole keskeneräisiä tuloksia', async ({
  page,
}) => {
  const hyvaksyttyJaPeruuntunutApplication = {
    ...hakemus1,
    haku: { ...hakemus1.haku, hakuaikaKaynnissa: false },
    hakemuksenTulokset: [
      { ...hakemuksenTulosHyvaksytty, hakukohdeOid: 'hakukohde-oid-1' },
      {
        ...hakemuksenTulosPeruuntunut,
        hakukohdeOid: 'hakukohde-oid-2',
        julkaistavissa: false,
      },
    ],
  };
  await mockHakemuksetFetch(page, {
    current: [hyvaksyttyJaPeruuntunutApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    app1.getByText('Hakuaika on päättynyt. Tällä hetkellä'),
  ).toBeHidden();
});

test('Näyttää jatkuvan haun hakemuksen joka ei ole käsittelyssä', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, { current: [hakemus5JatkuvaHaku], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  const app = page.getByTestId('application-hakemus-oid-5');
  await expect(app.getByText('Rötkönperän jatkuva haku')).toBeVisible();
  await expect(
    app.getByText('Lötkönperän koulutuskeskus, Sohva'),
  ).toBeVisible();
  await expect(
    app.getByText(
      'Olet täyttänyt hakemuksen. Voit muokata hakemustasi alla olevan painikkeen kautta',
    ),
  ).toBeVisible();
  await expect(
    app.getByText('Hakemuksesi on otettu käsittelyyn.'),
  ).toBeHidden();
  await expect(
    app.getByText('Valintojen tulokset julkaistaan hakijoille 24.1-25.1.2026.'),
  ).toBeHidden();
  await expect(
    app.getByText('Varasijoilta valitseminen päättyy 27.1.2026'),
  ).toBeHidden();

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(1);

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(0);
});

test('Näyttää jatkuvan haun hakemuksen joka on käsittelyssä', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [{ ...hakemus5JatkuvaHaku, processing: true }],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  const app = page.getByTestId('application-hakemus-oid-5');
  await expect(app.getByText('Rötkönperän jatkuva haku')).toBeVisible();
  await expect(
    app.getByText('Lötkönperän koulutuskeskus, Sohva'),
  ).toBeVisible();
  await expect(
    app.getByText(
      'Olet täyttänyt hakemuksen. Voit muokata hakemustasi alla olevan painikkeen kautta',
    ),
  ).toBeHidden();
  await expect(
    app.getByText('Hakemuksesi on otettu käsittelyyn.'),
  ).toBeVisible();
  await expect(
    app.getByText('Valintojen tulokset julkaistaan hakijoille 24.1-25.1.2026.'),
  ).toBeVisible();
  await expect(
    app.getByText('Varasijoilta valitseminen päättyy 27.1.2026'),
  ).toBeVisible();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);
});

test('Näyttää jatkuvan haun hakemuksen jonka tulokset ovat valmiit', async ({
  page,
}) => {
  const tulosHyvaksytty = {
    ...hakemuksenTulosHyvaksytty,
    hakukohdeOid: hakemus5JatkuvaHaku?.hakukohteet[0]?.oid,
    hakukohdeNimi: hakemus5JatkuvaHaku?.hakukohteet[1]?.nimi.fi,
  };
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus5JatkuvaHaku,
        processing: true,
        hakemuksenTulokset: [tulosHyvaksytty],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  const app = page.getByTestId('application-hakemus-oid-5');
  await expect(app.getByText('Rötkönperän jatkuva haku')).toBeVisible();
  await expect(app.getByText('Lötkönperän koulutuskeskus, Sohva')).toHaveCount(
    2,
  );
  await expect(
    app.getByText(
      'Olet täyttänyt hakemuksen. Voit muokata hakemustasi alla olevan painikkeen kautta',
    ),
  ).toBeHidden();
  await expect(
    app.getByText('Hakemuksesi on otettu käsittelyyn.'),
  ).toBeHidden();
  await expect(
    app.getByText('Valintojen tulokset julkaistaan hakijoille 24.1-25.1.2026.'),
  ).toBeHidden();
  await expect(
    app.getByText('Varasijoilta valitseminen päättyy 27.1.2026'),
  ).toBeHidden();
  const vastaanotot = page.getByTestId('vastaanotot-hakemus-oid-5');
  await expect(
    vastaanotot.getByText('Ota opiskelupaikka vastaan'),
  ).toBeVisible();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);

  await expect(
    hakemukset.getByRole('link', { name: 'Muokkaa hakemusta' }),
  ).toHaveCount(0);
});

test('Näyttää kelalinkin kun sellainen löytyy', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [
      hakemus1,
      {
        ...hakemus2,
        hakemuksenTulokset: [
          { ...hakemuksenTulosVastaanotettu, kelaURL: 'kela.fi' },
        ],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  await expect(
    hakemukset.getByRole('link', { name: 'Siirry Kelan asiointipalveluun' }),
  ).toHaveCount(1);
});

test('Näyttää migrilinkin kun sellainen löytyy', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [
      hakemus1,
      {
        ...hakemus2,
        hakemuksenTulokset: [
          {
            ...hakemuksenTulosVastaanotettu,
            showMigriURL: true,
            migriURL: 'migri.fi',
          },
        ],
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');
  await expect(
    hakemukset.getByText('Voit nyt hakea oleskelulupaa'),
  ).toBeVisible();
  await expect(
    hakemukset.getByRole('link', { name: 'opas opiskelijoille' }),
  ).toBeVisible();
  await expect(
    hakemukset.getByRole('link', { name: 'opas opiskelijoille' }),
  ).toHaveAttribute('href', 'https://migri.fi/opiskelijan-opas');

  await expect(
    hakemukset.getByRole('link', { name: 'Hae oleskelulupaa' }),
  ).toHaveCount(1);
});

test('Näyttää tutustu opiskelupaikkaan linkin', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [
      { ...hakemus1, hakemuksenTulokset: [hakemuksenTulosVastaanotettu] },
      hakemus2,
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('active-hakemukset');

  await expect(
    hakemukset.getByRole('link', {
      name: 'Tietoa opiskelupaikasta uudelle opiskelijalle',
    }),
  ).toHaveAttribute('href', 'linkkioppilaitokseen.fi');
});

test('Näyttää ei hakemuksia tekstin kun käyttäjällä ei ole hakemuksia', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, { current: [], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page.getByText('Sinulla ei ole ajankohtaisia opiskelupaikan hakemuksia.'),
  ).toBeVisible();
  await expect(
    page.getByText('Sinulla ei ole aiempia hakemuksia'),
  ).toBeVisible();
});

test('Näyttää hauttoman hakemuksen', async ({ page }) => {
  const oldApplication = {
    oid: 'hakemus-oid-07',
    secret: 'secret-07',
    haku: null,
    formName: {
      fi: 'Hajuton hakemus',
    },
    submitted: '2024-06-18T19:00:00',
    hakukohteet: [],
    ohjausparametrit: null,
  };
  await mockHakemuksetFetch(page, { current: [], old: [oldApplication] });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakemukset = page.getByTestId('past-hakemukset');

  const app = page.getByTestId('application-hakemus-oid-07');
  await expect(app.getByText('Hajuton hakemus')).toBeVisible();
  await expect(app.getByText('Hakutoiveesi')).toBeHidden();

  await expect(
    hakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);
});

test('Näyttää virheilmoituksen hakemukselle jonka rikastaminen epäonnistui', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [{ ...hakemus1, enrichmentFailed: true }],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app = page.getByTestId('application-hakemus-oid-1');
  await expect(app.getByTestId('error-box')).toBeVisible();
  await expect(
    app.getByText('Tietojen hakemisessa on ongelmia', { exact: true }),
  ).toBeVisible();
  await expect(
    app.getByText(
      'Hakemuksen hakemus-oid-1 tietojen hakemisessa on ongelmia. Hakemus on jätetty 18.10.2025.',
    ),
  ).toBeVisible();

  await expect(
    page.getByTestId('active-hakemukset').getByTestId('error-box'),
  ).toBeHidden();
});

test('Näyttää virheilmoituksen aktiiviselle hakemukselle jonka tulosten hakeminen epäonnistui', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [{ ...hakemus1, vtsFailed: true }],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app = page.getByTestId('application-hakemus-oid-1');
  const activehakemukset = page.getByTestId('active-hakemukset');
  await expect(activehakemukset.getByTestId('error-box')).toBeVisible();
  await expect(
    activehakemukset.getByText('Valintatulosten hakemisessa on ongelmia', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    activehakemukset.getByText(
      'Valitettavasti tietojen haku ei nyt onnistunut.',
    ),
  ).toBeVisible();
  await expect(
    app.getByText('Hakuaika päättyy 19.10.2025 klo 13:00.'),
  ).toBeVisible();
  await expect(
    activehakemukset.getByRole('link', { name: 'Näytä hakemus' }),
  ).toHaveCount(1);
  await expect(
    app.getByText('Hurrikaaniopiston erillishaku 2025'),
  ).toBeVisible();
  await expect(
    app.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(
    app.getByText('Hurrikaaniopisto, Hiekkalinnan kampus'),
  ).toBeVisible();
  await expect(
    app.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(
    app.getByText('Hurrikaaniopisto, Myrskynsilmän kampus'),
  ).toBeVisible();
});

test('Hakemusten saavutettavuus', async ({ page }) => {
  await mockHakemuksetFetch(page);
  await mockAuthenticatedUser(page);
  await page.goto('');
  await expect(
    page.getByText('Hurrikaaniopiston erillishaku 2025'),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});

test('Näyttää varoituksen, kun hakemusmaksu on maksamatta', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        paymentState: 'awaiting',
        paymentSum: '142',
        paymentDueDate: '2025-10-22',
        paymentLink: 'http://maksut.test/secret-6',
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const warning = page.getByTestId('warning-box');

  await expect(
    warning.getByText(
      'Jos et maksa hakemusmaksua määräaikaan mennessä, hakemustasi ei käsitellä, etkä voi tulla hyväksytyksi koulutukseen.',
    ),
  ).toBeVisible();
  await expect(warning.getByText('Määrä: 142€')).toBeVisible();
  await expect(warning.getByText('Eräpäivä: 22.10.2025')).toBeVisible();
  await expect(
    warning.getByText(
      'Maksu voimassa keväällä 2027 (1.1.2027 – 31.7.2027) alkavissa koulutuksissa',
    ),
  ).toBeVisible();
  await expect(warning.getByRole('link')).toHaveAttribute(
    'href',
    'http://maksut.test/secret-6',
  );
  await expect(warning.getByRole('link')).toHaveText('Siirry maksamaan');
  await expectPageAccessibilityOk(page);
});

test('Näyttää virheen, kun hakemusmaksu on erääntynyt', async ({ page }) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        paymentState: 'overdue',
        paymentSum: '112',
        paymentDueDate: '2025-09-17',
        paymentLink: 'http://maksut.test/secret-6',
        haku: { ...hakemus1.haku, aloituskausi: 'kausi_s' },
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const error = page.getByTestId('error-box');

  await expect(
    error.getByText(
      'Hakemusmaksun määräaika on erääntynyt, etkä voi enää maksaa hakemusmaksua.',
    ),
  ).toBeVisible();
  await expect(error.getByText('Määrä: 112€')).toBeVisible();
  await expect(error.getByText('Eräpäivä: 17.9.2025')).toBeVisible();
  await expectPageAccessibilityOk(page);
});

test('Näyttää maksun tiedot, kun hakemusmaksu on maksettu', async ({
  page,
}) => {
  await mockHakemuksetFetch(page, {
    current: [
      {
        ...hakemus1,
        paymentState: 'paid',
        paymentSum: '112',
        paymentDueDate: '2025-09-17',
        paymentLink: 'http://maksut.test/secret-6',
      },
    ],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const tiedotButton = page.getByRole('button', {
    name: 'Hakemusmaksun tiedot',
  });
  const hakemusmaksuTitle = page.getByRole('heading', { name: 'Hakemusmaksu' });

  await tiedotButton.click();
  await expect(
    page.getByText(
      'Olet maksanut hakemusmaksun. Olet saanut vahvistuksen maksun onnistumisesta sähköpostiisi. Olet saanut myös kuitin maksustasi erillisellä sähköpostilla.',
    ),
  ).toBeVisible();
  await expect(page.getByText('Maksettu')).toBeVisible();
  await expect(page.getByText('112€')).toBeVisible();
  await expect(
    page.getByText(
      'keväällä 2027 (1.1.2027 – 31.7.2027) alkavissa koulutuksissa',
    ),
  ).toBeVisible();

  await expect(hakemusmaksuTitle).toBeVisible();
  const suljeIcon = page.getByLabel('Sulje');
  await suljeIcon.click();
  await expect(hakemusmaksuTitle).toBeHidden();

  await tiedotButton.click();
  await expect(hakemusmaksuTitle).toBeVisible();
  const suljeButton = page.getByText('Sulje');
  await suljeButton.click();
  await expect(hakemusmaksuTitle).toBeHidden();

  await expectPageAccessibilityOk(page);
});
