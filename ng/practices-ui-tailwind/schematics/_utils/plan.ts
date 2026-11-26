import { Tree } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';
import { ImportResolutionContext, resolveAndRewriteImport } from './import-resolver';
import { isExcluded } from './whitelist';

export const MANIFEST_RELATIVE_PREFIX = '/schematics/add-component/files/';

/**
 * Reads a file of the packaged library snapshot, either from the tree (unit tests seed it there) or from the installed
 * package next to the compiled schematics.
 */
export function readPackagedFile(tree: Tree, originalRel: string): Buffer | null {
    const fromTree = tree.read(MANIFEST_RELATIVE_PREFIX + originalRel);
    if (fromTree) return fromTree;
    try {
        const candidate = path.join(path.resolve(__dirname, '..', 'add-component', 'files'), originalRel);
        if (fs.existsSync(candidate)) return fs.readFileSync(candidate);
    } catch {
        /* ignore fallback FS errors */
    }
    return null;
}

function stripComments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Relative resources (`templateUrl`, `styleUrl`, `styleUrls`) referenced by an Angular component source. */
export function findResourceReferences(source: string): string[] {
    const refs = new Set<string>();
    const single = /\b(?:templateUrl|styleUrl)\s*:\s*(['"`])([^'"`]+)\1/g;
    let match: RegExpExecArray | null;
    while ((match = single.exec(source))) refs.add(match[2]);

    const list = /\bstyleUrls\s*:\s*\[([^\]]*)\]/g;
    while ((match = list.exec(source))) {
        const item = /(['"`])([^'"`]+)\1/g;
        let entry: RegExpExecArray | null;
        while ((entry = item.exec(match[1]))) refs.add(entry[2]);
    }
    return Array.from(refs).filter((r) => r.startsWith('.'));
}

/**
 * Grows `planned` until it is closed: every planned TypeScript file contributes the (whitelisted) files it imports and
 * the templates / stylesheets it references. Without this a component that is only pulled in through an import would be
 * copied without its template and styles.
 */
export function expandPlan(
    planned: Set<string>,
    ctx: ImportResolutionContext,
    readOriginal: (originalRel: string) => Buffer | null,
    pkgName: string,
): void {
    const scanned = new Set<string>();
    const queue = Array.from(planned);
    while (queue.length) {
        const rel = queue.pop() as string;
        if (scanned.has(rel)) continue;
        scanned.add(rel);
        if (!rel.endsWith('.ts')) continue;

        const buf = readOriginal(rel);
        if (!buf) continue;
        // Commented out imports must not pull in (non existing) files
        const content = stripComments(buf.toString('utf8'));

        const importRe = /import\s+(?:[^'";]+?from\s+)?['"]([^'";]+)['"];?/g;
        let match: RegExpExecArray | null;
        while ((match = importRe.exec(content))) {
            resolveAndRewriteImport(rel, '', match[1], ctx, pkgName);
        }

        for (const ref of findResourceReferences(content)) {
            const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), ref));
            if (!isExcluded(target)) planned.add(target);
        }

        for (const candidate of planned) {
            if (!scanned.has(candidate)) queue.push(candidate);
        }
    }
}
