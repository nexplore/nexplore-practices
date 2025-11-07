import { JsonObject } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';
import { getExtractionLayoutConfig } from '../_utils/config';
import { readHashDb, sha256, writeHashDb } from '../_utils/hash-db';
import { ImportResolutionContext, mapOriginalToNew, resolveAndRewriteImport } from '../_utils/import-resolver';
import { loadManifest, resolveSelectedComponents } from '../_utils/manifest';
import { findAndCacheGlobalStylesEntry, getCachedGlobalStylesEntry } from '../_utils/styles-entry';
import { isWhitelisted } from '../_utils/whitelist';

type AddComponentOptions = JsonObject & {
    dest: string;
    names?: string;
    all?: boolean;
    moduleExports?: string;
    rewriteImports: boolean;
};

const LIB_PKG_NAME = '@nexplore/practices-ui-tailwind';
const MANIFEST_RELATIVE_PREFIX = '/schematics/add-component/files/';

export function addComponent(options: AddComponentOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const runId = Date.now().toString(36);
        const start = Date.now();
        const manifest = loadManifest(tree);
        const selected = resolveSelectedComponents(manifest, options);
        if (!selected.length) {
            context.logger.warn('[add-component] No components selected.');
            return tree;
        }
        context.logger.info(`[add-component] Selected components (including deps): ${selected.join(', ')}`);

        // Gather external dependencies from selected components
        const externalDepSet = new Set<string>();
        selected.forEach((comp) => {
            const entry = manifest.components[comp];
            if (entry && entry.externalDependencies) {
                entry.externalDependencies.forEach((d) => externalDepSet.add(d));
            }
        });
        const externalDeps = Array.from(externalDepSet).sort();
        if (externalDeps.length) {
            context.logger.info('[add-component] External dependencies referenced: ' + externalDeps.join(', '));
        }

        // Default destination root when not provided
        const hashDb = readHashDb(tree);
        const destRoot = normalizePath(options.dest || hashDb.dest || 'src/practices-ui-tailwind');
        if (!hashDb.dest) {
            hashDb.dest = destRoot;
        } else if (destRoot && hashDb.dest !== destRoot) {
            context.logger.info(
                `[add-component] Overriding previous destination ${hashDb.dest} with new dest ${destRoot}`,
            );
            hashDb.dest = destRoot;
        }
        const effectiveDest = hashDb.dest;

        const pkgVersion = readPackageVersion(tree);
        hashDb.libVersion = pkgVersion;
        hashDb.manifestVersion = manifest.version;

        const summary = { created: 0, skippedIdentical: 0, skippedConflict: 0 };

        // Determine the host app's primary global styles file (cached under .practices-ui)
        const globalStylesAbs = getCachedGlobalStylesEntry(tree) || findAndCacheGlobalStylesEntry(tree);

        // Phase 1: collect initial component file set
        const libRoot = 'src/lib';
        const planned = new Set<string>(); // original absolute paths (no leading /)
        const componentToFiles = new Map<string, string[]>();
        for (const comp of selected) {
            const entry = manifest.components[comp];
            if (!entry) continue;
            componentToFiles.set(comp, entry.files);
            entry.files.forEach((f) => planned.add(f));
        }

        // Import resolution context
        getExtractionLayoutConfig(); // currently returns constants; retained for future extension
        const ctxResolve: ImportResolutionContext = {
            libRoot,
            destRoot: effectiveDest,
            selectedComponents: new Set(selected),
            mapping: new Map(),
            ensureFilePlanned: (orig) => {
                if (planned.has(orig)) return;
                if (isWhitelisted(orig)) planned.add(orig);
            },
        };

        // Phase 2: scan imports to discover shared deps (single pass heuristic)
        const IMPORT_RE = /import\s+(?:[^'";]+?from\s+)?['"]([^'";]+)['"];?/g;
        const pkgName = LIB_PKG_NAME;
        for (const comp of selected) {
            const files = componentToFiles.get(comp) || [];
            for (const fileRel of files) {
                const srcPath = MANIFEST_RELATIVE_PREFIX + fileRel;
                let buf = tree.read(srcPath);
                if (!buf) {
                    try {
                        const baseDir = path.resolve(__dirname, '..', 'add-component', 'files');
                        const candidate = path.join(baseDir, fileRel);
                        if (fs.existsSync(candidate)) {
                            buf = fs.readFileSync(candidate);
                        }
                    } catch (_e) {
                        // ignore fallback FS errors
                    }
                }
                if (!buf) continue;
                const content = buf.toString('utf8');
                if (fileRel.endsWith('.ts')) {
                    let m: RegExpExecArray | null;
                    while ((m = IMPORT_RE.exec(content))) {
                        const spec = m[1];
                        resolveAndRewriteImport(fileRel, '', spec, ctxResolve, pkgName); // ensure planning of target (ignore returned path here)
                    }
                } else {
                    planned.add(fileRel); // include non-TS files referenced by component
                }
            }
        }

        context.logger.debug(
            `[add-component] Planned total files: ${planned.size} (components: ${selected.length}, external deps: ${
                planned.size - selected.length
            }), files: ${Array.from(planned).join(', ')}`,
        );

        // Phase 3: actually copy all planned files (components + discovered shared)
        for (const originalRel of planned) {
            const compName = originalRel.split('/')[2]; // src/lib/<comp>/...
            const isComponentFile = selected.includes(compName);
            const srcPath = MANIFEST_RELATIVE_PREFIX + originalRel;
            let buf = tree.read(srcPath);
            if (!buf) {
                try {
                    const baseDir = path.resolve(__dirname, '..', 'add-component', 'files');
                    const candidate = path.join(baseDir, originalRel);
                    if (fs.existsSync(candidate)) buf = fs.readFileSync(candidate);
                } catch (_e) {
                    // ignore fallback FS errors
                }
            }
            if (!buf) {
                context.logger.warn(`[add-component] Missing planned file ${originalRel}`);
                continue;
            }
            const newAbs = mapOriginalToNew(originalRel, ctxResolve);
            const destPath = newAbs.startsWith('/') ? newAbs : '/' + newAbs;
            let content = buf.toString('utf8');
            if (options.rewriteImports && originalRel.endsWith('.ts')) {
                // Rewrite import specifiers generically
                content = content.replace(IMPORT_RE, (full, spec) => {
                    const rewritten = resolveAndRewriteImport(originalRel, destPath, spec, ctxResolve, pkgName);
                    if (rewritten) {
                        return full.replace(spec, rewritten);
                    }
                    return full;
                });
            }
            // Rewrite CSS @reference to point at the host app's global styles entry (if detected)
            if ((originalRel.endsWith('.css') || originalRel.endsWith('.ts')) && globalStylesAbs) {
                const fromDir = path.posix.dirname(destPath);
                let rel = path.posix.relative(fromDir, globalStylesAbs);
                if (!rel.startsWith('.') && !rel.startsWith('/')) rel = './' + rel;
                // Replace any @reference '...styles.css' occurrences with the computed relative path
                content = content.replace(/@reference\s+(["'])(?:[^"']*?)styles\.css\1;?/g, (_m, q) => {
                    return `@reference ${q}${rel}${q};`;
                });
            }
            if (tree.exists(destPath)) {
                const existingBuf = tree.read(destPath);
                if (existingBuf && existingBuf.toString('utf8') === content) {
                    context.logger.debug(`[add-component] Skipping identical file: ${destPath}`);
                    summary.skippedIdentical++;
                    continue;
                } else if (existingBuf) {
                    const existing = existingBuf.toString('utf8');
                    const currentHash = sha256(existing);
                    hashDb.files[destPath] = {
                        hash: currentHash,
                        component: isComponentFile ? compName : 'shared',
                        sourceVersion: pkgVersion,
                        lastUpdatedByRunId: runId,
                    };
                    summary.skippedConflict++;
                    context.logger.warn(`[add-component] Conflict (left untouched): ${destPath}`);
                    continue;
                }
            }
            ensureDir(tree, destPath);
            tree.create(destPath, content);
            summary.created++;
            context.logger.debug(`[add-component] Created file: ${destPath}, ${content.length} bytes`);
            hashDb.files[destPath] = {
                hash: sha256(content),
                component: isComponentFile ? compName : 'shared',
                sourceVersion: pkgVersion,
                lastUpdatedByRunId: runId,
            };
        }

        hashDb.runs.push({
            runId,
            timestamp: new Date().toISOString(),
            action: 'add',
            selection: { selected },
            summary,
        });
        writeHashDb(tree, hashDb);

        // Patch root package.json with any missing external dependencies
        if (externalDeps.length) {
            const pkgPath = '/package.json';
            const pkgBuf = tree.read(pkgPath);
            if (pkgBuf) {
                try {
                    const pkg = JSON.parse(pkgBuf.toString('utf8')) as {
                        dependencies?: Record<string, string>;
                        devDependencies?: Record<string, string>;
                        peerDependencies?: Record<string, string>;
                    };
                    const dependencies = pkg.dependencies || (pkg.dependencies = {});
                    const already = new Set([
                        ...Object.keys(pkg.dependencies || {}),
                        ...Object.keys(pkg.devDependencies || {}),
                        ...Object.keys(pkg.peerDependencies || {}),
                    ]);
                    const toAdd: Record<string, string> = {};
                    for (const dep of externalDeps) {
                        if (already.has(dep)) continue;
                        const version = manifest.externalDependencyVersions?.[dep];
                        if (!version) {
                            context.logger.warn(
                                `[add-component] No version found for external dependency ${dep}; skipping automatic add.`,
                            );
                            continue;
                        }
                        toAdd[dep] = version;
                    }
                    const toAddKeys = Object.keys(toAdd);
                    if (toAddKeys.length) {
                        toAddKeys.forEach((k) => (dependencies[k] = toAdd[k]));
                        tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
                        context.logger.info(
                            `[add-component] Added ${toAddKeys.length} external package(s) to dependencies: ${toAddKeys.join(', ')}`,
                        );
                    } else {
                        context.logger.info('[add-component] No new external dependency packages needed.');
                    }
                } catch (e) {
                    context.logger.warn(
                        '[add-component] Failed to parse or update package.json: ' + (e as Error).message,
                    );
                }
            } else {
                context.logger.warn('[add-component] package.json not found; cannot add external dependencies.');
            }
        }
        context.logger.info(
            `[add-component] Completed in ${Date.now() - start}ms. Created=${summary.created}, Identical=${summary.skippedIdentical}, Conflicts=${summary.skippedConflict}`,
        );
        return tree;
    };
}

function readPackageVersion(tree: Tree): string | undefined {
    const pkgPath = '/package.json';
    const buf = tree.read(pkgPath);
    if (!buf) return undefined;
    try {
        const parsed: { version?: string } = JSON.parse(buf.toString('utf8'));
        return parsed.version;
    } catch {
        return undefined;
    }
}

function normalizePath(p: string): string {
    return p.replace(/\\/g, '/').replace(/\/$/, '');
}

function ensureDir(tree: Tree, filePath: string) {
    const segments = filePath.split('/');
    for (let i = 1; i < segments.length; i++) {
        const dir = segments.slice(0, i).join('/');
        if (dir && !tree.exists(dir)) {
            // Schematics Tree auto-creates parent dirs when creating files; explicit ensure optional
        }
    }
}

