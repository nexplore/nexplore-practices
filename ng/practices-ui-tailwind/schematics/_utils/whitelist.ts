// Whitelist configuration for files that can be auto-planned outside explicit component entries.
// Paths are evaluated relative to the library root 'src/'.
import { minimatch } from 'minimatch';

const patterns: string[] = [
    'lib/**', // everything under src/lib
    '*.module.ts', // root Angular modules
    'styles.css', // global styles
];

// Files that exist for the development of the library only (Storybook, unit tests) and must never end up in an app.
const excludedPatterns: string[] = [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.stories.*',
    '**/*.mdx',
    '**/stories/**',
    '**/spec/**',
];

export function isExcluded(originalAbs: string): boolean {
    return excludedPatterns.some((p) => minimatch(originalAbs, p, { dot: true }));
}

export function isWhitelisted(originalAbs: string): boolean {
    if (!originalAbs.startsWith('src/')) return false;
    if (isExcluded(originalAbs)) return false;
    const rel = originalAbs.slice(4);
    return patterns.some((p) => minimatch(rel, p, { dot: true }));
}

export function getWhitelistPatterns(): string[] {
    return [...patterns];
}

export function getExcludedPatterns(): string[] {
    return [...excludedPatterns];
}
