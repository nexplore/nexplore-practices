import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { storybookDir, storybookUrl } from './paths';
import { gotoStory, preparePage, settle } from './stabilize';

/** Ids of the stories of the build under test (older releases do not have all stories yet). */
const availableStoryIds: Set<string> = (() => {
    const indexFile = path.join(storybookDir, 'index.json');
    return existsSync(indexFile)
        ? new Set(Object.keys(JSON.parse(readFileSync(indexFile, 'utf-8')).entries))
        : new Set<string>();
})();

interface Interaction {
    storyId: string;
    /** Name of the state, part of the screenshot name. */
    name: string;
    /** Only run on this viewport, e.g. when the element only exists there. */
    viewport?: 'desktop' | 'mobile';
    act: (page: Page) => Promise<void>;
}

/** Moves the keyboard focus to the first focusable element, so the focus styles become visible. */
const focusFirst = (page: Page) => page.keyboard.press('Tab');
// Hover first and wait for the hover transition (the buttons scale), so overlays positioned relative to the button
// (e.g. the flyout) do not measure it in the middle of the transition.
const clickButton = (name: string | RegExp) => async (page: Page) => {
    const button = page.getByRole('button', { name }).first();
    await button.hover();
    await button.evaluate((element) =>
        Promise.all(
            element
                .getAnimations()
                .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
                .map((animation) => animation.finished)
        )
    );
    await button.click();
};
// Click at the start of the select, its center may be covered by the clear button.
// Open with the keyboard: the button scales on hover (CSS transition), so with the mouse the tooltip would measure its
// origin in the middle of the transition, depending on timing.
const openTooltipWithKeyboard = async (page: Page) => {
    await page.locator('puibe-tooltip-button button').focus();
    await page.keyboard.press('Enter');
};
const openSelect = (page: Page) =>
    page
        .locator('ng-select .ng-select-container')
        .first()
        .click({ position: { x: 12, y: 12 } });

/**
 * States that only appear after an interaction: opened overlays, expanded panels and keyboard focus. The default
 * state of every story is covered by storybook.spec.ts.
 */
const INTERACTIONS: Interaction[] = [
    // Keyboard focus
    { storyId: 'puibe-button--primary-button', name: 'focus', act: focusFirst },
    { storyId: 'puibe-button--secondary-button', name: 'focus', act: focusFirst },
    { storyId: 'puibe-button--primary-link-button', name: 'focus', act: focusFirst },
    { storyId: 'puibe-input--text-input', name: 'focus', act: focusFirst },
    { storyId: 'puibe-input--textarea', name: 'focus', act: focusFirst },
    { storyId: 'puibe-checkbox--checkbox', name: 'focus', act: focusFirst },
    { storyId: 'puibe-radio-button-group--radio-button-group', name: 'focus', act: focusFirst },
    { storyId: 'puibe-select--default', name: 'focus', act: focusFirst },
    { storyId: 'puibe-date-input--default', name: 'focus', act: focusFirst },
    { storyId: 'puibe-skip-link--default', name: 'focus', act: focusFirst },

    // Opened selects
    { storyId: 'puibe-select--default', name: 'open', act: openSelect },
    { storyId: 'puibe-select--with-initial-value', name: 'open', act: openSelect },
    { storyId: 'puibe-select--with-metadata-select', name: 'open', act: openSelect },
    { storyId: 'puibe-select--grouped', name: 'open', act: openSelect },
    {
        // The required select without value is displayed as invalid (hideInvalidIfUntouched is off by default): open,
        // close and reopen it, so the panel is shown after an interaction
        storyId: 'puibe-select--required-select',
        name: 'open-invalid',
        act: async (page) => {
            await openSelect(page);
            await page.keyboard.press('Escape');
            await page.mouse.click(5, 5);
            await openSelect(page);
        },
    },
    { storyId: 'puibe-select--multi-select-with-view-source', name: 'open', act: openSelect },
    // On small screens the tabs are rendered as select
    { storyId: 'puibe-tabs--tabs-default-story', name: 'open', viewport: 'mobile', act: openSelect },

    // Opened calendars
    {
        storyId: 'puibe-date-input--default',
        name: 'open-calendar',
        act: (page) => page.locator('puibe-form-field [role="button"], puibe-form-field button').first().click(),
    },
    {
        storyId: 'puibe-date-input--with-initial-date-value',
        name: 'open-calendar',
        act: (page) => page.locator('puibe-form-field [role="button"], puibe-form-field button').first().click(),
    },

    // Other overlays
    { storyId: 'puibe-dropdown-button--basic-dropdown', name: 'open', act: clickButton('Dropdown') },
    {
        storyId: 'puibe-tooltip--default',
        name: 'open',
        act: openTooltipWithKeyboard,
    },
    {
        storyId: 'puibe-tooltip--long-text',
        name: 'open',
        act: openTooltipWithKeyboard,
    },
    { storyId: 'puibe-popups--modal-and-flyout-service', name: 'open-modal', act: clickButton('open modal') },
    { storyId: 'puibe-popups--modal-and-flyout-service', name: 'open-flyout', act: clickButton('open flyout') },
    { storyId: 'puibe-action-dialog--action-dialog', name: 'open-confirmation', act: clickButton('open confirmation') },
    { storyId: 'puibe-action-dialog--action-dialog', name: 'open-delete', act: clickButton(/DELETE/) },
    { storyId: 'puibe-action-dialog--action-dialog', name: 'open-form', act: clickButton(/FORM/) },

    // Expanded panels
    {
        storyId: 'puibe-expansion-panel--closed-accordion-title-level-3-white-variation',
        name: 'expanded',
        act: (page) => page.locator('puibe-expansion-panel button').first().click(),
    },
];

const filter = process.env['VISUAL_FILTER'] ? new RegExp(process.env['VISUAL_FILTER'], 'i') : undefined;

test.describe('storybook interactions', () => {
    test.use({ baseURL: storybookUrl });

    for (const interaction of INTERACTIONS.filter((i) => !filter || filter.test(i.storyId))) {
        test(`${interaction.storyId} › ${interaction.name}`, async ({ page }, testInfo) => {
            test.skip(
                interaction.viewport !== undefined && interaction.viewport !== testInfo.project.name,
                `only relevant on ${interaction.viewport}`
            );
            test.skip(!availableStoryIds.has(interaction.storyId), 'the story does not exist in this build');
            await preparePage(page);
            await gotoStory(page, interaction.storyId);
            await settle(page);

            await interaction.act(page);
            await settle(page);

            // Viewport only (no full page): overlays are positioned relative to the viewport.
            await expect(page).toHaveScreenshot(`${interaction.storyId}--${interaction.name}.png`);
        });
    }
});
