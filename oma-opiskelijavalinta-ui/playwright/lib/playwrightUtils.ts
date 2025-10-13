import { expect, type Page } from '@playwright/test';
import AxeBuilder from "@axe-core/playwright";

export const expectPageAccessibilityOk = async (page: Page) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
};