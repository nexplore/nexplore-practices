import { existsSync } from 'node:fs';
import path from 'node:path';

/** Directory of the static Storybook build that is served and screenshotted. */
export const storybookDir = path.resolve(
    process.env['VISUAL_STORYBOOK_DIR'] ?? path.join(__dirname, '..', 'dist', 'storybook', 'practices-ui-ktbe')
);

/** Directory of the production build of samples-ktbe (the Angular application builder puts it into `browser/`). */
export const samplesDir = (() => {
    const dir = path.resolve(process.env['VISUAL_SAMPLES_DIR'] ?? path.join(__dirname, '..', 'dist', 'samples-ktbe'));
    return existsSync(path.join(dir, 'browser', 'index.html')) ? path.join(dir, 'browser') : dir;
})();

/** Directory holding the reference screenshots (committed with Git LFS, see README). */
export const snapshotDir = path.resolve(process.env['VISUAL_SNAPSHOT_DIR'] ?? path.join(__dirname, '__screenshots__'));

export const storybookPort = Number(process.env['VISUAL_STORYBOOK_PORT'] ?? 6106);
export const samplesPort = Number(process.env['VISUAL_SAMPLES_PORT'] ?? 6206);
export const storybookUrl = `http://127.0.0.1:${storybookPort}`;
export const samplesUrl = `http://127.0.0.1:${samplesPort}`;
