import { expect, test } from '@playwright/test';

test.describe('Etusivu', () => {

    test('Näyttää etusivun', async ({ page }) => {
        await page.goto('');
        await expect(page).toHaveTitle('Oma Opiskelijavalinta');
        await expect(
            page.getByText('Tervetuloa Oma-opiskelijavalintaan!'),
        ).toBeVisible();
    });
});
