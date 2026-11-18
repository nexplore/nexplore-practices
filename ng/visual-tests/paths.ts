import path from 'node:path';

/** Directory of the static Storybook build that is served and screenshotted. */
export const storybookDir = path.resolve(
    process.env['VISUAL_STORYBOOK_DIR'] ?? path.join(__dirname, '..', 'dist', 'storybook', 'practices-ui-ktbe')
);

/** Directory holding the reference screenshots (not committed, see README). */
export const snapshotDir = path.resolve(process.env['VISUAL_SNAPSHOT_DIR'] ?? path.join(__dirname, '__screenshots__'));

export const port = Number(process.env['VISUAL_PORT'] ?? 6106);
