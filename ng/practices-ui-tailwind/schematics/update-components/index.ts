import { JsonObject } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';
import { readHashDb, sha256, writeHashDb } from '../_utils/hash-db';
import { ImportResolutionContext, mapOriginalToNew, resolveAndRewriteImport } from '../_utils/import-resolver';
import { loadManifest, resolveSelectedComponents } from '../_utils/manifest';
import { isWhitelisted } from '../_utils/whitelist';

type UpdateComponentsOptions = JsonObject & {
    dest: string;
    names?: string;
    all?: boolean;
    moduleExports?: string;
    apply: 'auto' | 'conflicts' | 'all';
    rewriteImports: boolean;
};

const MANIFEST_RELATIVE_PREFIX = '/schematics/add-component/files/';

export function updateComponents(options: UpdateComponentsOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const runId = Date.now().toString(36);
        const start = Date.now();
        const manifest = loadManifest(tree);
        const selected = resolveSelectedComponents(manifest, options);
        if (!selected.length) {
            context.logger.warn('[update-components] No components selected.');
            return tree;
        }
        const hashDb = readHashDb(tree);
        if (!hashDb.dest) {
            context.logger.error('[update-components] Hash DB missing dest. Run add-component first.');
            return tree;
        }
        const destRoot = hashDb.dest;
        const applyMode = options.apply || 'auto';

        const summary = { updated: 0, skippedConflict: 0, skippedNoRecord: 0 };

        // Build planned set (component + discovered shared whitelisted) similar to add-component
        const planned = new Set<string>(); // original paths (src/..)
        const libRoot = 'src/lib';
        const componentToFiles = new Map<string, string[]>();
        for (const comp of selected) {
            const entry = manifest.components[comp];
            if (!entry) continue;
            componentToFiles.set(comp, entry.files);
            entry.files.forEach((f) => planned.add(f));
        }

        const ctxResolve: ImportResolutionContext = {
            libRoot,
            destRoot,
            selectedComponents: new Set(selected),
            mapping: new Map(),
            ensureFilePlanned: (orig) => {
                if (planned.has(orig)) return;
                if (isWhitelisted(orig)) planned.add(orig);
            },
        };

        const IMPORT_RE = /import\s+(?:[^'";]+?from\s+)?['"]([^'";]+)['"];?/g;
        const pkgName = '@nexplore/practices-ui-tailwind';
        for (const comp of selected) {
            const files = componentToFiles.get(comp) || [];
            for (const fileRel of files) {
                const srcPath = MANIFEST_RELATIVE_PREFIX + fileRel;
                let buf = tree.read(srcPath);
                if (!buf) {
                    try {
                        const baseDir = path.resolve(__dirname, '..', 'add-component', 'files');
                        const candidate = path.join(baseDir, fileRel);
                        if (fs.existsSync(candidate)) buf = fs.readFileSync(candidate);
                    } catch {
                        /* ignore */
                    }
                }
                if (!buf) continue;
                const content = buf.toString('utf8');
                if (fileRel.endsWith('.ts')) {
                    let m: RegExpExecArray | null;
                    while ((m = IMPORT_RE.exec(content))) {
                        const spec = m[1];
                        resolveAndRewriteImport(fileRel, '', spec, ctxResolve, pkgName);
                    }
                }
            }
        }

        // Now iterate all planned originals and perform update logic
        for (const originalRel of planned) {
            const compName = originalRel.startsWith('src/lib/') ? originalRel.split('/')[2] : undefined;
            const isComponentFile = compName ? selected.includes(compName) : false;
            const srcPath = MANIFEST_RELATIVE_PREFIX + originalRel;
            let packagedBuf = tree.read(srcPath);
            if (!packagedBuf) {
                try {
                    const baseDir = path.resolve(__dirname, '..', 'add-component', 'files');
                    const candidate = path.join(baseDir, originalRel);
                    if (fs.existsSync(candidate)) packagedBuf = fs.readFileSync(candidate);
                } catch {
                    /* ignore */
                }
            }
            if (!packagedBuf) {
                context.logger.warn(`[update-components] Missing planned file ${originalRel}`);
                continue;
            }
            const newAbs = mapOriginalToNew(originalRel, ctxResolve);
            const destPath = newAbs.startsWith('/') ? newAbs : '/' + newAbs;
            const packagedContentOriginal = packagedBuf.toString('utf8');
            let packagedContent = packagedContentOriginal;
            if (options.rewriteImports && originalRel.endsWith('.ts')) {
                packagedContent = packagedContentOriginal.replace(IMPORT_RE, (full, spec) => {
                    const rewritten = resolveAndRewriteImport(originalRel, destPath, spec, ctxResolve, pkgName);
                    return rewritten ? full.replace(spec, rewritten) : full;
                });
            }
            const packagedHash = sha256(packagedContent);
            const dbEntry = hashDb.files[destPath];
            const exists = tree.exists(destPath);
            const currentContentBuf = exists ? tree.read(destPath) : undefined;
            const currentContent = currentContentBuf ? currentContentBuf.toString('utf8') : undefined;
            const currentHash = currentContent ? sha256(currentContent) : undefined;
            let shouldWrite = false;
            if (!exists) {
                shouldWrite = true;
            } else if (!dbEntry) {
                if (applyMode === 'all' || applyMode === 'conflicts') shouldWrite = true;
                else summary.skippedNoRecord++;
            } else {
                const untouched = currentHash === dbEntry.hash;
                if (applyMode === 'auto') {
                    if (untouched) shouldWrite = true;
                    else summary.skippedConflict++;
                } else if (applyMode === 'conflicts') {
                    if (!untouched) shouldWrite = true;
                    else summary.skippedConflict++;
                } else if (applyMode === 'all') {
                    shouldWrite = true;
                }
            }
            if (shouldWrite) {
                if (exists) tree.overwrite(destPath, packagedContent);
                else tree.create(destPath, packagedContent);
                hashDb.files[destPath] = {
                    hash: packagedHash,
                    component: isComponentFile && compName ? compName : 'shared',
                    sourceVersion: hashDb.libVersion,
                    lastUpdatedByRunId: runId,
                };
                summary.updated++;
            }
        }

        hashDb.runs.push({
            runId,
            timestamp: new Date().toISOString(),
            action: 'update',
            selection: { selected, apply: applyMode },
            summary,
        });
        writeHashDb(tree, hashDb);
        context.logger.info(
            `[update-components] Completed in ${Date.now() - start}ms. Updated=${summary.updated} SkippedConflict=${summary.skippedConflict} SkippedNoRecord=${summary.skippedNoRecord}`,
        );
        return tree;
    };
}

// Removed legacy helpers (rewriteImports path-based update logic now inlined above)

