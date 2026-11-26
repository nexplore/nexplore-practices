import * as path from 'path';
import { isWhitelisted } from './whitelist';

export interface ImportResolutionContext {
    libRoot: string; // original library root, e.g. 'src/lib'
    destRoot: string; // destination root base selected by user (e.g. 'src/app/components')
    selectedComponents: Set<string>;
    mapping: Map<string, string>; // originalAbs -> newAbs
    ensureFilePlanned(originalAbs: string): void;
}

export interface ParsedImportSpecifier {
    type: 'relative' | 'package-internal' | 'external';
    raw: string; // raw specifier text
    originalTargetAbs?: string; // absolute path in original library (workspace relative, no leading /)
}

// Detect if specifier targets the internal library namespace
export function parseSpecifier(
    spec: string,
    importerOriginalAbs: string,
    ctx: ImportResolutionContext,
    pkgName: string,
): ParsedImportSpecifier {
    if (spec.startsWith('.')) {
        const importerDir = path.posix.dirname(importerOriginalAbs);
        const resolved = path.posix.normalize(path.posix.join(importerDir, spec));
        const hasKnownExt = /\.(ts|js|mjs|cjs|cts|mts|tsx|jsx|css|scss|sass|less|html|json)$/.test(resolved);
        return { type: 'relative', raw: spec, originalTargetAbs: hasKnownExt ? resolved : resolved + '.ts' };
    }
    if (spec === pkgName || spec.startsWith(pkgName + '/')) {
        const tail = spec === pkgName ? '' : spec.slice(pkgName.length + 1);
        const target = path.posix.join(ctx.libRoot, tail);
        const hasKnownExt = /\.(ts|js|mjs|cjs|cts|mts|tsx|jsx|css|scss|sass|less|html|json)$/.test(target);
        return { type: 'package-internal', raw: spec, originalTargetAbs: hasKnownExt ? target : target + '.ts' };
    }
    return { type: 'external', raw: spec };
}

export function classifyOriginal(
    originalAbs: string,
    ctx: ImportResolutionContext,
): { kind: 'component' | 'shared'; componentName?: string } {
    // Component names are taken as immediate directory names under src/lib/<component>
    if (originalAbs.startsWith(ctx.libRoot + '/')) {
        const rel = originalAbs.slice(ctx.libRoot.length + 1);
        const first = rel.split('/')[0];
        if (ctx.selectedComponents.has(first)) return { kind: 'component', componentName: first };
    }
    return { kind: 'shared' };
}

export function mapOriginalToNew(originalAbs: string, ctx: ImportResolutionContext): string {
    const cached = ctx.mapping.get(originalAbs);
    if (cached) return cached;
    // Mirror everything after 'src/' directly under destRoot
    const relFromSrc = originalAbs.startsWith('src/') ? originalAbs.slice(4) : originalAbs;
    const newPath = '/' + path.posix.join(ctx.destRoot, relFromSrc).replace(/^\/+/, '');
    ctx.mapping.set(originalAbs, newPath);
    return newPath;
}

export function resolveAndRewriteImport(
    importerOriginalAbs: string,
    importerNewAbs: string,
    spec: string,
    ctx: ImportResolutionContext,
    pkgName: string,
): string | null {
    const parsed = parseSpecifier(spec, importerOriginalAbs, ctx, pkgName);
    if (parsed.type === 'external') return null;
    if (!parsed.originalTargetAbs) return null;
    // Only plan whitelisted files
    if (isWhitelisted(parsed.originalTargetAbs)) {
        ctx.ensureFilePlanned(parsed.originalTargetAbs);
    }
    const targetNewAbs = mapOriginalToNew(parsed.originalTargetAbs, ctx);
    const fromDir = path.posix.dirname(importerNewAbs);
    let rel = path.posix.relative(fromDir, targetNewAbs);
    if (!rel.startsWith('.')) rel = './' + rel;
    rel = rel.replace(/\.ts$/i, '');
    return rel;
}

