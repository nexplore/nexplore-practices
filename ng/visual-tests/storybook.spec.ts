import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { storybookDir, storybookUrl } from './paths';
import { gotoStory, preparePage, settle } from './stabilize';

interface StoryIndexEntry {
    id: string;
    title: string;
    name: string;
    type: 'story' | 'docs';
    tags?: string[];
}

/** Stories tagged with this tag are excluded from visual comparison (e.g. inherently non-deterministic ones). */
const SKIP_TAG = 'no-visual-test';

const indexFile = path.join(storybookDir, 'index.json');

function readStories(): StoryIndexEntry[] {
    if (!existsSync(indexFile)) {
        return [];
    }
    const index = JSON.parse(readFileSync(indexFile, 'utf-8')) as { entries: Record<string, StoryIndexEntry> };
    const filter = process.env['VISUAL_FILTER'] ? new RegExp(process.env['VISUAL_FILTER'], 'i') : undefined;
    return Object.values(index.entries)
        .filter((entry) => entry.type === 'story')
        .filter((entry) => !entry.tags?.includes(SKIP_TAG))
        .filter((entry) => !filter || filter.test(entry.id));
}

test.describe('storybook', () => {
    test.use({ baseURL: storybookUrl });

    // Without a Storybook build, only the other specs (e.g. samples-ktbe) run.
    test.skip(
        !existsSync(indexFile),
        `No Storybook build found at ${storybookDir}. Run "npm run build-storybook-ktbe".`
    );

    for (const story of readStories()) {
        test(`${story.title} › ${story.name}`, async ({ page }) => {
            await preparePage(page);
            await gotoStory(page, story.id);
            await settle(page);

            await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
        });
    }
});
