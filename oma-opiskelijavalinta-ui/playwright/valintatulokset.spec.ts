import { expect, test } from '@playwright/test';
import {
  mockApplicationsFetch,
  mockAuthenticatedUser,
} from './lib/playwrightUtils';
import {
  hakemuksenTulosHylatty,
  hakemuksenTulosHyvaksytty,
  hakemuksenTulosKesken,
  hakemuksenTulosPeruuntunut,
  hakemuksenTulosVarasijalla,
  hakemus1,
  hakemus2,
  jonokohtaisetTulostiedot,
  jonokohtaisetTulostiedotEhdollinen,
  jonokohtaisetTulostiedotPeruuntunut,
} from './mocks';

test('Näyttää varasijanumeron', async ({ page }) => {
  const varasijaApplication = {
    ...hakemus1,
    hakemuksenTulokset: [hakemuksenTulosVarasijalla],
  };
  await mockApplicationsFetch(page, {
    current: [varasijaApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Tornadoinen tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Olet 2. varasijalla')).toBeVisible();
});

test('Näyttää hyväksytyn tuloksen', async ({ page }) => {
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
});

test('Näyttää hylätyn tuloksen', async ({ page }) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await mockApplicationsFetch(page, { current: [hylattyApplication], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [varasijaApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');
  const app1 = page.getByTestId('application-hakemus-oid-1');
  await expect(
    app1.getByText('Meteorologi, Hurrikaanien tutkimislinja'),
  ).toBeVisible();
  await expect(app1.getByText('Kesken')).toBeVisible();
});

test('Näyttää kesken-tuloksen jos hakuaika on päättynyt ja tulosta ei ole julkaistu', async ({
  page,
}) => {
  await mockApplicationsFetch(page, {
    current: [hakemus2],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const hakutoive = page.getByTestId('application-hakutoiveet-hakemus-oid-2');
  await expect(
    hakutoive.getByText('Meteorologi, Hyökyaaltojen tutkimislinja'),
  ).toBeVisible();
  await expect(
    hakutoive.locator('.MuiChip-root').first().getByText('Hyväksytty'),
  ).toBeVisible();
  await expect(hakutoive.getByText('Ehdollinen')).toBeVisible();
});

test('Näyttää peruuntuneelle tulokselle tilan kuvauksen', async ({ page }) => {
  const hyvaksyttyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [{ ...hakemuksenTulosPeruuntunut }],
  };
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
      { ...hakemuksenTulosKesken, hakukohdeOid: 'hakukohde-oid-1' },
      {
        ...hakemuksenTulosHyvaksytty,
        hakukohdeOid: 'hakukohde-oid-2',
        valintatila: 'HYVAKSYTTY',
        vastaanotettavuustila: 'EI_VASTAANOTETTAVISSA',
      },
    ],
  };
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyOdottaaApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
});

test('Näyttää hylätyn tuloksen tarkenteen ilman valintatapajonoa kun sijoittelu ei ole käytössä', async ({
  page,
}) => {
  const hylattyApplication = {
    ...hakemus2,
    hakemuksenTulokset: [hakemuksenTulosHylatty],
  };
  await mockApplicationsFetch(page, { current: [hylattyApplication], old: [] });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [hyvaksyttyApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

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
  await mockApplicationsFetch(page, {
    current: [peruuntunutApplication],
    old: [],
  });
  await mockAuthenticatedUser(page);
  await page.goto('');

  const paasykoevalintaRow = page.getByTestId(
    'valintatapajono-paasykoevalinta',
  );
  await expect(
    paasykoevalintaRow.getByText(
      'Peruuntunut - Olet vastaanottanut toisen opiskelupaikan',
    ),
  ).toBeVisible();
});
