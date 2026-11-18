import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { storybookDir } from './paths';

interface StoryIndexEntry {
    id: string;
    title: string;
    name: string;
    type: 'story' | 'docs';
    tags?: string[];
}

/** Stories tagged with this tag are excluded from visual comparison (e.g. inherently non-deterministic ones). */
const SKIP_TAG = 'no-visual-test';

/** Fixed point in time so date pickers, calendars, timelines etc. render deterministically. */
const FIXED_NOW = new Date('2025-03-14T10:00:00+01:00');

/** Virtual time that is fast-forwarded after rendering, longer than the longest simulated delay in the stories. */
const SETTLE_TIME_MS = 30_000;

function readStories(): StoryIndexEntry[] {
    const indexFile = path.join(storybookDir, 'index.json');
    if (!existsSync(indexFile)) {
        throw new Error(`No Storybook build found at ${storybookDir}. Run "npm run build-storybook-ktbe" first.`);
    }
    const index = JSON.parse(readFileSync(indexFile, 'utf-8')) as { entries: Record<string, StoryIndexEntry> };
    const filter = process.env['VISUAL_FILTER'] ? new RegExp(process.env['VISUAL_FILTER'], 'i') : undefined;
    return Object.values(index.entries)
        .filter((entry) => entry.type === 'story')
        .filter((entry) => !entry.tags?.includes(SKIP_TAG))
        .filter((entry) => !filter || filter.test(entry.id));
}

for (const story of readStories()) {
    test(`${story.title} › ${story.name}`, async ({ page }) => {
        // Fake timers: dates are fixed and pending timers (async validators, simulated requests, ...)
        // can be fast-forwarded, so every story is captured in a deterministic end state.
        await page.clock.install({ time: FIXED_NOW });
        // Some stories use Math.random (e.g. randomAsyncValidator), make it reproducible.
        await page.addInitScript(() => {
            let seed = 42;
            Math.random = () => {
                seed = (seed + 0x6d2b79f5) | 0;
                let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
                t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        });
        await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);

        // Wait until Storybook rendered the story (or reported an error).
        await page.waitForFunction(
            () =>
                document.body.classList.contains('sb-show-main') ||
                document.body.classList.contains('sb-show-errordisplay')
        );
        await expect(page.locator('body')).not.toHaveClass(/sb-show-errordisplay/);

        await page.clock.runFor(SETTLE_TIME_MS);
        // SVG SMIL animations (e.g. the spinner icon) are not covered by Playwright's `animations: 'disabled'`.
        await page.evaluate(() =>
            document.querySelectorAll('svg').forEach((svg) => {
                svg.pauseAnimations();
                svg.setCurrentTime(0);
            })
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
    });
}
