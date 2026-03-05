import { expect, test } from '@playwright/test';

test('Näyttää virheelliselle osoitepolulle Sivua ei löytynyt -sivun', async ({
  page,
}) => {
  await page.goto(`oma-opiskelijavalinta/foobar`);
  await expect(page.getByText('Sivua ei löytynyt')).toBeVisible();
  await expect(
    page.getByText('Tarkista sivun osoite ja yritä uudelleen'),
  ).toBeVisible();
  const frontPageButton = page.getByRole('link', {
    name: 'Oma Opintopolun etusivulle',
  });
  await expect(frontPageButton).toBeVisible();
});
