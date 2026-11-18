import { expect, Page } from '@playwright/test';

/** Fixed point in time so date pickers, calendars, timelines etc. render deterministically. */
const FIXED_NOW = new Date('2025-03-14T10:00:00+01:00');

/** Virtual time that is fast-forwarded after rendering, longer than the longest simulated delay in the stories. */
const SETTLE_TIME_MS = 30_000;

/**
 * Prepares a page before navigating: fake timers (dates are fixed and pending timers can be fast-forwarded) and a
 * seeded `Math.random` (some stories use it, e.g. `randomAsyncValidator`).
 */
export async function preparePage(page: Page): Promise<void> {
    await page.clock.install({ time: FIXED_NOW });
    await page.addInitScript(() => {
        let seed = 42;
        Math.random = () => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    });
}

/** Opens a story and waits until Storybook rendered it. */
export async function gotoStory(page: Page, storyId: string): Promise<void> {
    await page.goto(`/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`);
    await page.waitForFunction(
        () =>
            document.body.classList.contains('sb-show-main') || document.body.classList.contains('sb-show-errordisplay')
    );
    await expect(page.locator('body')).not.toHaveClass(/sb-show-errordisplay/);
}

/**
 * Brings the page into a deterministic end state: fast-forwards all pending timers (async validators, simulated
 * requests, status messages, ...), pauses SVG (SMIL) animations, which Playwright's `animations: 'disabled'` does
 * not cover (e.g. the spinner icon), and waits for fonts and network.
 */
export async function settle(page: Page): Promise<void> {
    await page.clock.runFor(SETTLE_TIME_MS);
    // Some work is triggered by real browser events outside of the fake clock (e.g. ResizeObserver callbacks of the
    // label directive) and schedules further timers or animation frames. Give it real time to happen, then run the
    // fake clock again, so it does not depend on timing whether this work is done before the screenshot.
    for (let i = 0; i < 3; i++) {
        await page.waitForTimeout(100);
        await page.clock.runFor(1_000);
    }
    await page.evaluate(() =>
        document.querySelectorAll('svg').forEach((svg) => {
            svg.pauseAnimations();
            svg.setCurrentTime(0);
        })
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
}
