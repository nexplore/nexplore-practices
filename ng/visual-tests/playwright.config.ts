import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { port, snapshotDir, storybookDir } from './paths';

export default defineConfig({
    testDir: __dirname,
    testMatch: '*.spec.ts',
    snapshotPathTemplate: path.join(snapshotDir, '{projectName}', '{arg}{ext}'),
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
        baseURL: `http://127.0.0.1:${port}`,
        locale: 'de-CH',
        timezoneId: 'Europe/Zurich',
        colorScheme: 'light',
    },
    projects: [
        { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
        { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    ],
    webServer: {
        command: `node "${path.join(__dirname, 'serve-static.mjs')}" "${storybookDir}" ${port}`,
        url: `http://127.0.0.1:${port}/index.json`,
        reuseExistingServer: false,
    },
});
