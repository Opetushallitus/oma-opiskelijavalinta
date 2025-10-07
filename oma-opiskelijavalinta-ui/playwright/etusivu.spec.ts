import { expect, test } from '@playwright/test';
import {expectPageAccessibilityOk} from "./lib/playwrightUtils";

test('Näyttää etusivun', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveTitle('Oma Opiskelijavalinta');
    await expect(
        page.getByText('Tervetuloa Oma-opiskelijavalintaan!'),
    ).toBeVisible();
});

test('Etusivun saavutettavuus', async ({ page }) => {
    await page.goto('');
    await expect(
        page.getByText('Tervetuloa Oma-opiskelijavalintaan!'),
    ).toBeVisible();
    await expectPageAccessibilityOk(page);
});
