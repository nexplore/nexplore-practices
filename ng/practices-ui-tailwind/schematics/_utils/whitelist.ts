// Whitelist configuration for files that can be auto-planned outside explicit component entries.
// Paths are evaluated relative to the library root 'src/'.
import { minimatch } from 'minimatch';

const patterns: string[] = [
    'lib/**', // everything under src/lib
    '*.module.ts', // root Angular modules
    'styles.css', // global styles
];

export function isWhitelisted(originalAbs: string): boolean {
    if (!originalAbs.startsWith('src/')) return false;
    const rel = originalAbs.slice(4);
    return patterns.some((p) => minimatch(rel, p, { dot: true }));
}

export function getWhitelistPatterns(): string[] {
    return [...patterns];
}

