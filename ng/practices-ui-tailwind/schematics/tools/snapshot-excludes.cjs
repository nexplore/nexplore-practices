/**
 * Files of the library that are never part of the snapshot shipped with the schematics (Storybook stories, unit
 * tests). Keep in sync with `getExcludedPatterns()` in `_utils/whitelist.ts` (checked by a spec).
 */
module.exports = ['**/*.spec.ts', '**/*.test.ts', '**/*.stories.*', '**/*.mdx', '**/stories/**', '**/spec/**'];
