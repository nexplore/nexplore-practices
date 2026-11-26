import { describe, expect, it } from '@jest/globals';
import { getExcludedPatterns } from '../_utils/whitelist';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const snapshotExcludes: string[] = require('./snapshot-excludes.cjs');

describe('snapshot excludes', () => {
    it('are the same for the build scripts and the schematics', () => {
        expect([...snapshotExcludes].sort()).toEqual(getExcludedPatterns().sort());
    });
});
