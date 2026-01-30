import { expect, test, type Page } from '@playwright/test';
import {
  mockHakemuksetFetch,
  mockAuthenticatedUser,
  expectPageAccessibilityOk,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosHylatty,
  hakemuksenTulosHyvaksytty,
  hakemuksenTulosPeruuntunut,
  hakemuksenTulosVarasijalla,
  hakemus1,
  hakemus2,
  hakemus3ToinenAste,
  hakemus4ToinenAsteAlempiaHyvaksyttyja,
  jonokohtaisetTulostiedot,
  jonokohtaisetTulostiedotEhdollinen,
  jonokohtaisetTulostiedotPeruuntunut,
} from './mocks';

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchMockData(page: Page, application: any) {
  await mockHakemuksetFetch(page, {
    current: [application],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
}

test('Näyttää varasijanumeron', async ({ page }) => {
  const varasijaApplication = {
    ...hakemus1,
    ohjausparametrit: {
      ...hakemus1.ohjausparametrit,
      varasijatayttoPaattyy: 1768143600000,
    },
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await fetchMockData(page, varasijaApplication);

  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Olet 2. varasijalla')).toBeVisible();
  await expect(
    app1.getByText(
      'Varasijalta hyväksytään opiskelijoita, jos aloituspaikkoja vapautuu.',
    ),
  ).toBeVisible();
  await expect(
    app1.getByText(
      'Voit tulla hyväksytyksi varasijalta 11.1.2026 klo 17:00 asti.',
    ),
  ).toBeVisible();
});

test('Näyttää hyväksytyn tuloksen', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const app = page.getByTestId('application-hakemus-oid-2');
  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    tulokset.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    tulokset.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(app.getByText('Hakutoiveesi')).toBeHidden();
  await expect(app.getByText('Valintatilanteesi')).toBeVisible();
  await expect(
    page.getByTestId('valintatilainfo-hakukohde-oid-3'),
  ).toBeVisible();
});

test('Näyttää hyväksytylle kk-tulokselle vastaanottoinfon', async ({
  page,
}) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    tulokset.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(
    tulokset.getByText(
      'Ota opiskelupaikka vastaan viimeistään 11.12.2025 klo 15:00 mennessä tai menetät paikan.',
    ),
  ).toBeVisible();
});

test('Näyttää hyväksytylle 2. asteen tulokselle vastaanottoinfon', async ({
  page,
}) => {
  await fetchMockData(page, hakemus3ToinenAste);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-3');
  await expect(
    tulokset.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(
    tulokset.getByText(
      'Ota opiskelupaikka vastaan viimeistään 11.12.2025 klo 15:00 mennessä tai voit menettää paikan.',
    ),
  ).toBeVisible();
});

test('Näyttää priorisoinnittoman kk-haun hyväksytylle tulokselle infon peruuntumisesta jos on toinen hakutoive varasijalla', async ({
  page,
}) => {
  const varallaApplication = {
    ...hakemus1,
    ohjausparametrit: {
      ...hakemus1.ohjausparametrit,
      jarjestetytHakutoiveet: false,
    },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosVarasijalla,
        hakukohdeOid: 'hakukohde-oid-1',
      },
      {
        ...hakemuksenTulosHyvaksytty,
        hakukohdeOid: 'hakukohde-oid-2',
        valintatila: 'HYVAKSYTTY',
        vastaanotettavuustila: 'VASTAANOTETTAVISSA',
      },
    ],
  };
  await fetchMockData(page, varallaApplication);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-1');
  await expect(
    tulokset.getByText(
      'Kun otat opiskelupaikan vastaan, muiden hakutoiveiden varasijat peruuntuvat samalla.',
    ),
  ).toBeVisible();
});

test('Ei näytä priorisoinnittoman kk-haun hyväksytylle tulokselle infoa peruuntumisesta jos ei ole muu hakutoive varasijalla', async ({
  page,
}) => {
  const varallaApplication = {
    ...hakemus2,
    ohjausparametrit: {
      ...hakemus2.ohjausparametrit,
      jarjestetytHakutoiveet: false,
    },
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await fetchMockData(page, varallaApplication);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    tulokset.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(
    tulokset.getByText(
      'Kun otat opiskelupaikan vastaan, muiden hakutoiveiden varasijat peruuntuvat samalla.',
    ),
  ).toBeHidden();
});

test('Näyttää priorisoinnittoman kk-haun varasijalla-tulokselle infon peruuntumisesta kun toinen hakutoive on hyväksytty', async ({
  page,
}) => {
  const hyvaksyttyJaVarallaApplication = {
    ...hakemus1,
    ohjausparametrit: {
      ...hakemus1.ohjausparametrit,
      jarjestetytHakutoiveet: false,
    },
    hakemuksenTulokset: [
      hakemuksenTulosVarasijalla,
      {
        ...hakemuksenTulosHyvaksytty,
        hakukohdeOid: 'hakukohde-oid-2',
        valintatila: 'HYVAKSYTTY',
        vastaanotettavuustila: 'VASTAANOTETTAVISSA',
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyJaVarallaApplication);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-1');
  await expect(
    tulokset.locator('.MuiChip-root').first().getByText('Varasijalla'),
  ).toBeVisible();
  await expect(
    tulokset.getByText(
      'Tämä varasija peruuntuu, jos otat toisen hakutoiveen opiskelupaikan vastaan.',
    ),
  ).toBeVisible();
});

test('Näyttää priorisoidun kk-haun alemman hakutoiveen hyväksytylle tulokselle infon jonotuksesta', async ({
  page,
}) => {
  const ylempiVarallaApplication = {
    ...hakemus1,
    ohjausparametrit: {
      ...hakemus1.ohjausparametrit,
      jarjestetytHakutoiveet: true,
    },
    hakemuksenTulokset: [
      hakemuksenTulosVarasijalla,
      {
        ...hakemuksenTulosHyvaksytty,
        hakukohdeOid: 'hakukohde-oid-2',
        valintatila: 'HYVAKSYTTY',
        vastaanotettavuustila: 'VASTAANOTETTAVISSA',
      },
    ],
  };
  await fetchMockData(page, ylempiVarallaApplication);

  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-1');
  await expect(
    tulokset.getByText(
      'Kun otat opiskelupaikan vastaan, valitse lisäksi jäätkö jonottamaan ylempiä varasijatoiveita.',
    ),
  ).toBeVisible();
});

test('Näyttää 2. asteen haussa infon varasijan säilymisestä jos on ylempi hakutoive varalla ja alempi hyväksytty', async ({
  page,
}) => {
  const hyvaksyttyJaVaralla2asteApplication = {
    ...hakemus4ToinenAsteAlempiaHyvaksyttyja,
    hakemuksenTulokset: [
      {
        ...hakemus4ToinenAsteAlempiaHyvaksyttyja.hakemuksenTulokset[0],
        valintatila: 'VARALLA',
        vastaanottotila: 'KESKEN',
        vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      },
      {
        ...hakemus4ToinenAsteAlempiaHyvaksyttyja.hakemuksenTulokset[1],
        vastaanottotila: 'KESKEN',
        vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      },
      {
        ...hakemus4ToinenAsteAlempiaHyvaksyttyja.hakemuksenTulokset[2],
        vastaanottotila: 'KESKEN',
        vastaanotettavuustila: 'VASTAANOTETTAVISSA_SITOVASTI',
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyJaVaralla2asteApplication);

  const infoToive1 = page.getByTestId('valintatilainfo-hakukohde-oid-4');
  await expect(
    infoToive1.getByText(
      'Kun otat toisen opiskelupaikan vastaan, olet edelleen varasijalla tähän hakukohteeseen.',
    ),
  ).toBeVisible();
  await expect(
    infoToive1.getByText(
      'Tämä varasija peruuntuu, jos otat toisen hakutoiveen opiskelupaikan vastaan.',
    ),
  ).toBeHidden();
  const infoToive2 = page.getByTestId('valintatilainfo-hakukohde-oid-5');
  await expect(
    infoToive2.getByText(
      'Opiskelupaikan vastaanottaminen ei vaikuta varasijoihin. Kun otat tämän opiskelupaikan vastaan, olet edelleen varasijalla ylempään hakutoiveeseen.',
    ),
  ).toBeVisible();
  await expect(
    infoToive2.getByText(
      'Kun otat opiskelupaikan vastaan, muiden hakutoiveiden varasijat peruuntuvat samalla.',
    ),
  ).toBeHidden();
});

test('Näyttää hylätyn tuloksen', async ({ page }) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await fetchMockData(page, hylattyApplication);

  const app = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    app.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(app.getByText('Et saanut tätä opiskelupaikkaa')).toBeVisible();
});

test('Näyttää kesken-tuloksen jos toisella hakutoiveella on julkaistu tulos', async ({
  page,
}) => {
  const varasijaApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await fetchMockData(page, varasijaApplication);
  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Kesken')).toBeVisible();
  await expect(
    page.getByTestId('valintatilainfo-hakukohde-oid-1'),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatilainfo-hakukohde-oid-2'),
  ).toBeHidden();
});

test('Näyttää kesken-tuloksen jos hakuaika on päättynyt ja tulosta ei ole julkaistu', async ({
  page,
}) => {
  await fetchMockData(page, hakemus2);

  const app = page.getByTestId('application-hakemus-oid-2');
  const tulokset = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    tulokset.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(tulokset.getByText('Kesken')).toBeVisible();
  await expect(app.getByText('Hakutoiveesi')).toBeHidden();
  await expect(app.getByText('Valintatilanteesi')).toBeVisible();
});

test('Näyttää ehdollisesti hyväksytyn tuloksen', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [
      { ...hakemuksenTulosHyvaksytty, ehdollisestiHyvaksyttavissa: true },
    ],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const hakutoive = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    hakutoive.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    hakutoive.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(
    hakutoive.locator('.MuiChip-root').getByText('Ehdollinen'),
  ).toBeVisible();
  await expect(
    hakutoive.getByText('Huomioithan, että valintatietosi on ehdollinen'),
  ).toBeVisible();
});

test('Näyttää peruuntuneelle tulokselle tilan kuvauksen', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [{ ...hakemuksenTulosPeruuntunut }],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const app = page.getByTestId('application-hakemus-oid-2');
  await expect(
    app.getByText('Peruuntunut - Sait ylemmän hakutoiveen opiskelupaikan'),
  ).toBeVisible();
});

test('Näyttää Hyväksytty -tiedon tarkenteella jos priorisoidun haun ylemmällä hakutoiveella on valinta kesken', async ({
  page,
}) => {
  const hyvaksyttyOdottaaApplication = {
    ...hakemus1,
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        hakukohdeOid: 'hakukohde-oid-2',
        valintatila: 'HYVAKSYTTY',
        vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyOdottaaApplication);

  const hyvaksyttyOdottaaApp = page.getByTestId('application-hakemus-oid-1');
  await expect(
    hyvaksyttyOdottaaApp
      .locator('.MuiChip-root')
      .first()
      .getByText('Opiskelijavalinta kesken'),
  ).toBeVisible();
  await expect(
    hyvaksyttyOdottaaApp.getByText(
      'Hyväksytty (odottaa ylempien hakukohteiden tuloksia)',
    ),
  ).toBeVisible();
  await expect(
    hyvaksyttyOdottaaApp.getByText(
      'Et voi ottaa tätä opiskelupaikkaa vastaan.',
    ),
  ).toBeVisible();
  await expect(
    hyvaksyttyOdottaaApp.getByText(
      'Jos tulet hyväksytyksi ylempään hakutoiveeseesi, tämä hakukohde peruuntuu automaattisesti.',
    ),
  ).toBeVisible();
});

test('Näyttää hylätyn tuloksen tarkenteen ilman valintatapajonoa kun sijoittelu ei ole käytössä', async ({
  page,
}) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await fetchMockData(page, hylattyApplication);

  const tulos = page.getByTestId('application-tulos-hakukohde-oid-3');
  await expect(tulos.getByText('Et saanut opiskelupaikkaa')).toBeVisible();
  await expect(tulos.getByText('Pohjakoulutus ei ole riittävä')).toBeVisible();
});

test('Näyttää hyväksytyn tuloksen ilman valintatapajonoa kun sijoittelu ei ole käytössä', async ({
  page,
}) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHyvaksytty],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const tulos = page.getByTestId('application-tulos-hakukohde-oid-3');
  await expect(tulos.getByText('Hyväksytty')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('Näyttää varasijan ilman valintatapajonoa kun sijoittelu ei ole käytössä', async ({
  page,
}) => {
  const hyvaksyttyApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const tulos = page.getByTestId('application-tulos-hakukohde-oid-1');
  await expect(tulos.getByText('Varasijalla: 2')).toBeVisible();
});

test('Näyttää valintatapajonojen tiedot kun sijoittelu on käytössä', async ({
  page,
}) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot: jonokohtaisetTulostiedot,
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const todistusvalintaRow = page.getByTestId(
    'valintatapajono-todistusvalinta',
  );
  await expect(
    todistusvalintaRow.getByText('Ei hyväksytty tällä valintatavalla'),
  ).toBeVisible();
  await expect(
    todistusvalintaRow.getByText('Pisteraja ei ylittynyt'),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-todistusvalinta-pisteet').getByText('30'),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('valintatapajono-todistusvalinta-alinhyvaksytty')
      .getByText('40'),
  ).toBeVisible();
  const paasykoevalintaRow = page.getByTestId(
    'valintatapajono-paasykoevalinta',
  );
  await expect(paasykoevalintaRow.getByText('Hyväksytty')).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-paasykoevalinta-pisteet').getByText('50'),
  ).toBeVisible();
  await expect(
    page
      .getByTestId('valintatapajono-paasykoevalinta-alinhyvaksytty')
      .getByText('45'),
  ).toBeVisible();
});

test('Näyttää valintatapajonojen tiedoissa ehdollisen hyväksymisen', async ({
  page,
}) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot: jonokohtaisetTulostiedotEhdollinen,
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyApplication);

  const paasykoevalintaRow = page.getByTestId(
    'valintatapajono-paasykoevalinta',
  );
  await expect(paasykoevalintaRow.getByText('Hyväksytty')).toBeVisible();
  await expect(paasykoevalintaRow.getByText('Ehdollinen')).toBeVisible();
});

test('Näyttää peruuntuneelle valintatapajonolle selitteen', async ({
  page,
}) => {
  const peruuntunutApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot: jonokohtaisetTulostiedotPeruuntunut,
      },
    ],
  };
  await fetchMockData(page, peruuntunutApplication);

  const paasykoevalintaRow = page.getByTestId(
    'valintatapajono-paasykoevalinta',
  );
  await expect(
    paasykoevalintaRow.getByText(
      'Peruuntunut - Olet vastaanottanut toisen opiskelupaikan',
    ),
  ).toBeVisible();
});

test('Näyttää valintatapajonot mobiililayoutissa ilman taulukkoa', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });

  const hyvaksyttyApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot,
      },
    ],
  };

  await fetchMockData(page, hyvaksyttyApplication);

  await expect(page.getByTestId('valintatapajono-mobile')).toBeVisible();

  await expect(page.getByRole('table')).toHaveCount(0);

  await expect(page.getByText('Valintatapa').first()).toBeVisible();
  await expect(page.getByText('Pisteesi').first()).toBeVisible();
  await expect(page.getByText('Valinnan tulos').first()).toBeVisible();
  await expect(page.getByText('Todistusvalinta').first()).toBeVisible();

  const todistusvalintaRow = page.getByTestId('valintatapajono-1234');
  await expect(
    todistusvalintaRow.getByText('Ei hyväksytty tällä valintatavalla'),
  ).toBeVisible();
  await expect(
    todistusvalintaRow.getByText('Pisteraja ei ylittynyt'),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-1234-pisteet').getByText('30'),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-1234-alinhyvaksytty').getByText('40'),
  ).toBeVisible();
  const paasykoevalintaRow = page.getByTestId('valintatapajono-2345');
  await expect(
    paasykoevalintaRow.getByText('Hyväksytty', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-2345-pisteet').getByText('50'),
  ).toBeVisible();
  await expect(
    page.getByTestId('valintatapajono-2345-alinhyvaksytty').getByText('45'),
  ).toBeVisible();
});

test('Tulos ilman valintatapajonoa on saavutettava', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await fetchMockData(page, hyvaksyttyApplication);
  const tulos = page.getByTestId('application-tulos-hakukohde-oid-1');
  await expect(tulos.getByText('Varasijalla: 2')).toBeVisible();
  await expectPageAccessibilityOk(page);
});

test('Valintatapajonojen tulos on saavutettava', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot: jonokohtaisetTulostiedot,
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyApplication);
  const todistusvalintaRow = page.getByTestId(
    'valintatapajono-todistusvalinta',
  );
  await expect(
    todistusvalintaRow.getByText('Ei hyväksytty tällä valintatavalla'),
  ).toBeVisible();
  await expectPageAccessibilityOk(page);
});

test('Valintatapajonojen mobiililayout on saavutettava', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });

  const hyvaksyttyApplication = {
    ...hakemus2,
    ohjausparametrit: { ...hakemus2.ohjausparametrit, sijoittelu: true },
    hakemuksenTulokset: [
      {
        ...hakemuksenTulosHyvaksytty,
        jonokohtaisetTulostiedot,
      },
    ],
  };
  await fetchMockData(page, hyvaksyttyApplication);
  await expect(page.getByTestId('valintatapajono-mobile')).toBeVisible();
  await expectPageAccessibilityOk(page);
});
