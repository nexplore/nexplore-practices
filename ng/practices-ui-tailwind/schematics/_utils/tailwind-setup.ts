import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'path';
import { readHashDb, writeHashDb } from './hash-db';
import { readPackagedFile } from './plan';
import { findAndCacheGlobalStylesEntry } from './styles-entry';

export const LIB_PKG_NAME = '@nexplore/practices-ui-tailwind';

/** Packages Tailwind CSS 4 needs in an Angular application (https://tailwindcss.com/docs/installation/framework-guides/angular). */
export const TAILWIND_DEV_DEPENDENCIES: Record<string, string> = {
    '@tailwindcss/postcss': '^4.1.13',
    postcss: '^8.5.0',
    tailwindcss: '^4.1.13',
};

const POSTCSS_PLUGIN = '@tailwindcss/postcss';
const STYLE_PREEXISTING_EXTENSIONS = /\.css$/i;

const toPosix = (p: string) => p.replace(/\\/g, '/');
const withLeadingSlash = (p: string) => (p.startsWith('/') ? p : '/' + p);

function readJson<T>(tree: Tree, file: string): T | undefined {
    const buf = tree.read(file);
    if (!buf) return undefined;
    try {
        return JSON.parse(buf.toString('utf8')) as T;
    } catch {
        return undefined;
    }
}

function writeJson(tree: Tree, file: string, value: unknown) {
    const text = JSON.stringify(value, null, 2) + '\n';
    if (tree.exists(file)) tree.overwrite(file, text);
    else tree.create(file, text);
}

/** Copies a stylesheet of the library snapshot (`src/<fileName>`) below `destRoot` unless it is already there. */
export function copyLibraryStyle(tree: Tree, context: SchematicContext, fileName: string, destRoot: string): boolean {
    const buf = readPackagedFile(tree, 'src/' + fileName);
    if (!buf) {
        context.logger.warn(`[ng-add] ${fileName} not found in the package; skipping copy.`);
        return false;
    }
    const destPath = `/${toPosix(destRoot)}/${fileName}`.replace(/\/+/g, '/');
    if (tree.exists(destPath)) return true;
    tree.create(destPath, buf);
    context.logger.info(`[ng-add] Copied ${fileName} to ${destPath}`);
    return true;
}

/** Adds the PostCSS plugin of Tailwind 4 to the PostCSS configuration of the workspace (creates it if needed). */
export function ensurePostcssConfig(tree: Tree, context: SchematicContext) {
    const candidates = ['/.postcssrc.json', '/postcss.config.json'];
    const existing = candidates.find((c) => tree.exists(c));
    if (!existing) {
        const jsConfig = ['/postcss.config.js', '/postcss.config.mjs', '/postcss.config.cjs', '/.postcssrc.js'].find(
            (c) => tree.exists(c),
        );
        if (jsConfig) {
            context.logger.warn(
                `[ng-add] Found ${jsConfig}. Add the "${POSTCSS_PLUGIN}" plugin to it, Tailwind CSS is not processed otherwise.`,
            );
            return;
        }
        writeJson(tree, '/.postcssrc.json', { plugins: { [POSTCSS_PLUGIN]: {} } });
        context.logger.info(`[ng-add] Created .postcssrc.json with the ${POSTCSS_PLUGIN} plugin`);
        return;
    }

    const config = readJson<{ plugins?: Record<string, unknown> | string[] }>(tree, existing);
    if (!config) {
        context.logger.warn(`[ng-add] Could not parse ${existing}. Add the "${POSTCSS_PLUGIN}" plugin to it manually.`);
        return;
    }
    const plugins = config.plugins ?? {};
    if (Array.isArray(plugins)) {
        if (plugins.includes(POSTCSS_PLUGIN)) return;
        config.plugins = [...plugins, POSTCSS_PLUGIN];
    } else {
        if (POSTCSS_PLUGIN in plugins) return;
        config.plugins = { ...plugins, [POSTCSS_PLUGIN]: {} };
    }
    writeJson(tree, existing, config);
    context.logger.info(`[ng-add] Added the ${POSTCSS_PLUGIN} plugin to ${existing.slice(1)}`);
}

/** Adds missing Tailwind packages to the devDependencies of the app and schedules an install. */
export function ensureTailwindDependencies(tree: Tree, context: SchematicContext) {
    const pkg = readJson<{
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
    }>(tree, '/package.json');
    if (!pkg) {
        context.logger.warn('[ng-add] package.json not found; install tailwindcss and @tailwindcss/postcss manually.');
        return;
    }
    const known = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
    const missing = Object.entries(TAILWIND_DEV_DEPENDENCIES).filter(([name]) => !(name in known));
    if (!missing.length) return;

    const devDependencies = { ...pkg.devDependencies };
    missing.forEach(([name, version]) => (devDependencies[name] = version));
    pkg.devDependencies = Object.fromEntries(Object.entries(devDependencies).sort(([a], [b]) => a.localeCompare(b)));
    writeJson(tree, '/package.json', pkg);
    context.logger.info(`[ng-add] Added ${missing.map(([n]) => n).join(', ')} to devDependencies`);
    context.addTask(new NodePackageInstallTask());
}

interface WorkspaceTarget {
    options?: { styles?: unknown[]; [key: string]: unknown };
    [key: string]: unknown;
}
interface WorkspaceProject {
    sourceRoot?: string;
    root?: string;
    architect?: Record<string, WorkspaceTarget>;
    targets?: Record<string, WorkspaceTarget>;
}
interface Workspace {
    projects?: Record<string, WorkspaceProject>;
}

/** Adds a global stylesheet to the `styles` of the build target of the first application. */
export function registerGlobalStyle(tree: Tree, stylePath: string, prepend: boolean): boolean {
    const workspace = readJson<Workspace>(tree, '/angular.json');
    if (!workspace?.projects) return false;
    const relative = stylePath.replace(/^\//, '');
    for (const project of Object.values(workspace.projects)) {
        const build = (project.architect ?? project.targets)?.['build'];
        if (!build) continue;
        const options = (build.options ??= {});
        const styles = Array.isArray(options.styles) ? options.styles : (options.styles = []);
        const alreadyRegistered = styles.some((s) => (typeof s === 'string' ? s : (s as { input?: string })?.input) === relative);
        if (!alreadyRegistered) {
            if (prepend) styles.unshift(relative);
            else styles.push(relative);
        }
        writeJson(tree, '/angular.json', workspace);
        return true;
    }
    return false;
}

function firstSourceRoot(tree: Tree): string {
    const workspace = readJson<Workspace>(tree, '/angular.json');
    for (const project of Object.values(workspace?.projects ?? {})) {
        if (project.sourceRoot) return toPosix(project.sourceRoot).replace(/\/$/, '');
    }
    return 'src';
}

/** The lines every Tailwind 4 setup needs in its entry stylesheet, with paths relative to `entryPath`. */
export function buildTailwindStyleLines(
    entryPath: string,
    destRoot: string,
    theme: string,
    libraryPackageRoot = `node_modules/${LIB_PKG_NAME}`,
): { imports: string[]; sources: string[] } {
    const fromDir = path.posix.dirname(entryPath);
    const relativeTo = (target: string) => {
        const rel = path.posix.relative(fromDir, target);
        return rel.startsWith('.') ? rel : './' + rel;
    };
    const dest = withLeadingSlash(toPosix(destRoot));
    return {
        imports: [
            `@import 'tailwindcss';`,
            `@import '${relativeTo(`${dest}/${theme}`)}';`,
            `@import '${relativeTo(`${dest}/tailwind.css`)}';`,
        ],
        // Tailwind ignores node_modules, so the classes used by the compiled package must be registered explicitly
        sources: [`@source '${relativeTo('/' + libraryPackageRoot)}';`],
    };
}

/** Inserts the lines that are not yet part of the stylesheet; keeps the existing content below them. */
export function applyTailwindStyleLines(content: string, lines: { imports: string[]; sources: string[] }): string {
    const has = (line: string) => {
        const target = line.match(/['"]([^'"]+)['"]/)?.[1];
        if (!target) return content.includes(line);
        if (line.startsWith('@import')) {
            return new RegExp(`@import\\s+(?:url\\()?['"]${escapeRegExp(target)}['"]`).test(content);
        }
        return new RegExp(`@source\\s+['"]${escapeRegExp(target)}['"]`).test(content);
    };
    // A theme of another run (theme-*.css) must not be added a second time next to the chosen one
    const imports = lines.imports.filter((l) => !has(l));
    const sources = lines.sources.filter((l) => !has(l));
    if (!imports.length && !sources.length) return content;
    const block = [...imports, ...sources].join('\n') + '\n';
    return block + content;
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Makes sure an application stylesheet imports Tailwind CSS, the theme and the library styles.
 *
 * - CSS entry stylesheet: the imports are added to it.
 * - No styles configured, or the configured file is missing: a stylesheet is created and registered in angular.json.
 * - Sass/Less entry: Tailwind CSS 4 does not run on preprocessor output, so a dedicated CSS entry is added next to the
 *   copied library files and registered in front of the existing styles.
 *
 * Returns the stylesheet that contains the setup.
 */
export function setupGlobalStyles(
    tree: Tree,
    context: SchematicContext,
    theme: string,
    destRoot: string,
): string | undefined {
    let entry = findAndCacheGlobalStylesEntry(tree);
    const normalizedDest = toPosix(destRoot).replace(/^\/|\/$/g, '');

    if (entry && !tree.exists(entry) && STYLE_PREEXISTING_EXTENSIONS.test(entry)) {
        // Configured in angular.json, but the file does not exist (yet)
        tree.create(entry, '');
        context.logger.info(`[ng-add] Created missing stylesheet ${entry}`);
    } else if (entry && !STYLE_PREEXISTING_EXTENSIONS.test(entry)) {
        context.logger.warn(
            `[ng-add] ${entry} is not a CSS file. Tailwind CSS 4 does not process Sass/Less, a separate CSS entry is used.`,
        );
        entry = undefined;
        const dedicated = `/${normalizedDest}/styles.css`;
        if (!tree.exists(dedicated)) tree.create(dedicated, '');
        if (!registerGlobalStyle(tree, dedicated, true)) {
            context.logger.warn(`[ng-add] Could not register ${dedicated} in angular.json; add it to "styles".`);
        }
        entry = dedicated;
    } else if (!entry) {
        const created = `/${firstSourceRoot(tree)}/styles.css`;
        if (!tree.exists(created)) tree.create(created, '');
        if (!registerGlobalStyle(tree, created, false)) {
            context.logger.warn(`[ng-add] Could not register ${created} in angular.json; add it to "styles".`);
        }
        entry = created;
        context.logger.info(`[ng-add] No global stylesheet configured, created ${created}`);
    }

    const content = tree.read(entry)?.toString('utf8') ?? '';
    const updated = applyTailwindStyleLines(content, buildTailwindStyleLines(entry, normalizedDest, theme));
    if (updated !== content) {
        tree.overwrite(entry, updated);
        context.logger.info(`[ng-add] Added the Tailwind CSS setup to ${entry}`);
    }

    // add-component rewrites `@reference` of the copied component styles to this file
    const db = readHashDb(tree);
    if (db.globalStylesEntry !== entry) {
        db.globalStylesEntry = entry;
        writeHashDb(tree, db);
    }
    return entry;
}
