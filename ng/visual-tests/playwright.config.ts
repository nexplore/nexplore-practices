import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { samplesDir, samplesPort, samplesUrl, snapshotDir, storybookDir, storybookPort, storybookUrl } from './paths';

const serveStatic = path.join(__dirname, 'serve-static.mjs');

const webServers = [
    existsSync(path.join(storybookDir, 'index.json')) && {
        command: `node "${serveStatic}" "${storybookDir}" ${storybookPort}`,
        url: `${storybookUrl}/index.json`,
        reuseExistingServer: false,
    },
    existsSync(path.join(samplesDir, 'index.html')) && {
        command: `node "${serveStatic}" "${samplesDir}" ${samplesPort} --spa`,
        url: `${samplesUrl}/index.html`,
        reuseExistingServer: false,
    },
].filter((server) => !!server);

export default defineConfig({
    testDir: __dirname,
    testMatch: '*.spec.ts',
    snapshotPathTemplate: path.join(snapshotDir, '{projectName}', '{testFileName}', '{arg}{ext}'),
    outputDir: path.join(__dirname, 'test-results'),
    reporter: [['list'], ['html', { outputFolder: path.join(__dirname, 'report'), open: 'never' }]],
    fullyParallel: true,
    retries: 0,
    // A missing reference screenshot is a failure, never silently written.
    updateSnapshots: 'none',
    timeout: 60_000,
    expect: {
        toHaveScreenshot: {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            // Tolerate anti-aliasing noise only, every real change should be visible.
            threshold: 0.2,
            maxDiffPixels: 20,
        },
    },
    use: {
        locale: 'de-CH',
        timezoneId: 'Europe/Zurich',
        colorScheme: 'light',
    },
    projects: [
        { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
        { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    ],
    // Only serve the builds that exist, so e.g. the samples-ktbe tests also run without a Storybook build.
    webServer: webServers,
});
