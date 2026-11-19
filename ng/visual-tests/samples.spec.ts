import { expect, Page, test } from '@playwright/test';
import { samplesUrl } from './paths';
import { preparePage, settle } from './stabilize';

/**
 * Pages of samples-ktbe. They show the components together in the shell (header, side navigation, footer,
 * breadcrumb), which the isolated stories do not cover.
 */
const PAGES: string[] = [
    '',
    'typography',
    'form-elements',
    'form-with-hide-invalid',
    'expansion-panels',
    'tables',
    'tables-infinite-scrolling',
    'buttons',
    'radio-buttons',
    'checkboxes',
    'toasts',
    'popups',
    'timeline',
    'sidepanel',
    'status-hub',
    'misc',
    'tabs',
    'lazy',
    'breadcrumb',
];

/** Interactions on samples pages: opened overlays and menus. */
const INTERACTIONS: {
    page: string;
    name: string;
    viewport?: 'desktop' | 'mobile';
    act: (page: Page) => Promise<void>;
}[] = [
    {
        page: 'sidepanel',
        name: 'open-side-overlay-panel',
        act: (page) => page.getByTitle('Click to open the side overlay panel').click(),
    },
    {
        page: '',
        name: 'open-mobile-menu',
        viewport: 'mobile',
        act: (page) => page.locator('button[puibeHeaderMobileMenuItem]').last().click(),
    },
];

const filter = process.env['VISUAL_FILTER'] ? new RegExp(process.env['VISUAL_FILTER'], 'i') : undefined;
const screenshotName = (pagePath: string) => `samples-${pagePath || 'home'}`;

async function gotoSamplesPage(page: Page, pagePath: string) {
    await preparePage(page);
    await page.goto(`/${pagePath}`);
    await page.locator('puibe-shell').waitFor();
    await settle(page);
}

test.describe('samples-ktbe', () => {
    test.use({ baseURL: samplesUrl });

    for (const pagePath of PAGES.filter((p) => !filter || filter.test(screenshotName(p)))) {
        test(`page /${pagePath}`, async ({ page }) => {
            await gotoSamplesPage(page, pagePath);
            await expect(page).toHaveScreenshot(`${screenshotName(pagePath)}.png`, { fullPage: true });
        });
    }

    for (const interaction of INTERACTIONS.filter(
        (i) => !filter || filter.test(`${screenshotName(i.page)}--${i.name}`)
    )) {
        test(`page /${interaction.page} › ${interaction.name}`, async ({ page }, testInfo) => {
            test.skip(
                interaction.viewport !== undefined && interaction.viewport !== testInfo.project.name,
                `only relevant on ${interaction.viewport}`
            );
            await gotoSamplesPage(page, interaction.page);
            await interaction.act(page);
            await settle(page);
            await expect(page).toHaveScreenshot(`${screenshotName(interaction.page)}--${interaction.name}.png`);
        });
    }
});
