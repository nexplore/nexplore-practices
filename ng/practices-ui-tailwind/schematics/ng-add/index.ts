import { isJsonArray, JsonObject } from '@angular-devkit/core';
import { chain, externalSchematic, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { readHashDb, writeHashDb } from '../_utils/hash-db';
import { loadManifest, updateManifest } from '../_utils/manifest';
import { findAndCacheGlobalStylesEntry } from '../_utils/styles-entry';

type NgAddOptions = JsonObject & {
    theme?: string;
    skipShell?: boolean;
    skipProvider?: boolean;
    dest?: string;
};

const COLLECTION_PATH = './collection.json';

export function ngAdd(options: NgAddOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const themes = discoverThemes();
        const chosenTheme = validateTheme(options.theme, themes, context);

        const hashDb = readHashDb(tree);

        const destRoot = options.dest || hashDb.dest || 'src/practices-ui-tailwind';
        if (!hashDb.dest) {
            hashDb.dest = destRoot;
            writeHashDb(tree, hashDb);
        }
        // Copy theme file like code file if present.
        copyTheme(tree, context, chosenTheme, destRoot);

        // Inject @import for the theme into the main styles file declared in angular.json
        addThemeImport(tree, context, chosenTheme, destRoot);

        const rules: Rule[] = [];
        rules.push(getPackageDependencyVersions);

        if (options.features && isJsonArray(options.features)) {
            options.features.forEach((feat) => {
                rules.push(
                    externalSchematic(COLLECTION_PATH, 'add-component', {
                        names: feat,
                        rewriteImports: true,
                        dest: destRoot,
                    }),
                );
            });

            if (!options.skipProvider && options.features.includes('providers')) {
                // inject provider after providers copied
                rules.push((tree2: Tree, ctx2: SchematicContext) => {
                    injectProvider(tree2, ctx2);
                    return tree2;
                });
            }
        }

        rules.push(logTutorial(themes, chosenTheme, !options.skipProvider));
        return chain(rules)(tree, context);
    };
}

async function getPackageDependencyVersions() {
    // Root is the practices-ui-tailwind package root
    const root = path.resolve(__dirname, '..', '..');

    // Read versions from this library's package.json peerDependencies (fall back to dependencies/devDependencies if absent)
    const manifest = loadManifest();
    let externalDependencyVersions: Record<string, string> = manifest.externalDependencyVersions || {};
    try {
        const pkgJsonPath = path.join(root, 'package.json');
        const pkgRaw = await fs.promises.readFile(pkgJsonPath, 'utf8');
        const pkg = JSON.parse(pkgRaw);
        const versionSources: Record<string, string> = {
            ...(pkg.peerDependencies || {}),
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {}),
        };
        for (const dep of Object.keys(externalDependencyVersions)) {
            const ver = versionSources[dep];
            if (ver === '?') {
                externalDependencyVersions[dep] = versionSources[dep] || 'latest';
            }
        }

        // Write updated manifest back to disk
        updateManifest({
            ...manifest,
            externalDependencyVersions: externalDependencyVersions,
        });
    } catch (e) {
        console.warn('[generate-manifest] Could not read package.json for version mapping:', e.message || e);
    }
}

function discoverThemes(): string[] {
    const themes: string[] = [];
    // New snapshot layout copies entire src under /schematics/add-component/files/src
    // Read theme files from the published package (not the host tree), just like copyTheme.
    const themesDir = path.resolve(__dirname, '..', 'add-component', 'files', 'src');
    if (fs.existsSync(themesDir)) {
        for (const file of fs.readdirSync(themesDir)) {
            if (/^theme(-.*)?\.css$/.test(file)) themes.push(file);
        }
    }
    // Only return actual discovered themes (no placeholder injection)
    return Array.from(new Set(themes)).sort();
}

function validateTheme(requested: string | undefined, themes: string[], context: SchematicContext): string {
    if (requested && themes.includes(requested)) return requested;
    if (requested && !themes.includes(requested)) {
        context.logger.warn(`[ng-add] Requested theme ${requested} not found. Falling back to default.`);
    }
    // Prefer theme.css if present; else first available; else no-op
    if (themes.includes('theme.css')) return 'theme.css';
    return themes[0] || 'theme.css';
}

function copyTheme(tree: Tree, context: SchematicContext, theme: string, destRoot: string) {
    // Theme files live inside the published package, not the host tree.
    const fsPath = path.resolve(__dirname, '..', 'add-component', 'files', 'src', theme);
    if (!fs.existsSync(fsPath)) {
        context.logger.warn(`[ng-add] Theme asset ${theme} not found in package at ${fsPath}; skipping copy.`);
        return;
    }
    const buf = fs.readFileSync(fsPath);

    // Place theme at destination root (not under /lib) to allow consumer to decide import placement.
    const destPath = `/${destRoot.replace(/\\/g, '/')}/${theme}`;
    if (tree.exists(destPath)) return;
    tree.create(destPath, buf);
    context.logger.info(`[ng-add] Copied theme file ${theme} to ${destPath}`);
}

function injectProvider(tree: Tree, context: SchematicContext) {
    const mainPath = '/src/main.ts';
    if (!tree.exists(mainPath)) {
        context.logger.warn('[ng-add] No main.ts found for provider injection.');
        return;
    }
    const mainBuf = tree.read(mainPath);
    if (!mainBuf) {
        context.logger.warn('[ng-add] main.ts became unreadable.');
        return;
    }
    const sourceText = mainBuf.toString('utf8');
    const sf = ts.createSourceFile(mainPath, sourceText, ts.ScriptTarget.Latest, true);
    const printer = ts.createPrinter();
    let updatedMain = sourceText;
    let mutated = false;

    const provideIdent = 'providePracticesTailwind';
    const hashDb = readHashDb(tree);
    const destRoot = hashDb.dest || 'src/practices-ui-tailwind';
    const providerModulePathNoExt = `${destRoot.replace(/\\/g, '/')}/lib/providers/practices-tailwind.providers`;
    const importNeeded = !new RegExp(`import[^;]+${provideIdent}`).test(sourceText);

    let bootstrapCall: ts.CallExpression | undefined;
    sf.forEachChild(function walk(node) {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'bootstrapApplication'
        ) {
            bootstrapCall = node;
        }
        node.forEachChild(walk);
    });
    if (!bootstrapCall) {
        context.logger.warn('[ng-add] bootstrapApplication call not found in main.ts.');
        return;
    }
    const args = [...bootstrapCall.arguments];
    if (args.length < 1) return; // unexpected structure
    if (args.length === 1) {
        // add second arg with providers array
        const newCall = ts.factory.createCallExpression(bootstrapCall.expression, bootstrapCall.typeArguments, [
            args[0],
            ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        'providers',
                        ts.factory.createArrayLiteralExpression([
                            ts.factory.createCallExpression(ts.factory.createIdentifier(provideIdent), undefined, []),
                        ]),
                    ),
                ],
                true,
            ),
        ]);
        updatedMain = replaceRange(
            sourceText,
            bootstrapCall.getStart(),
            bootstrapCall.getEnd(),
            printer.printNode(ts.EmitHint.Unspecified, newCall, sf),
        );
        mutated = true;
    } else if (args.length >= 2) {
        const second = args[1];
        if (ts.isObjectLiteralExpression(second)) {
            const hasProviders = second.properties.some(
                (p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'providers',
            );
            let newSecond = second;
            if (hasProviders) {
                const providersProp = second.properties.find(
                    (p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'providers',
                ) as ts.PropertyAssignment | undefined;
                if (providersProp && ts.isArrayLiteralExpression(providersProp.initializer)) {
                    const arr = providersProp.initializer;
                    const already = arr.elements.some(
                        (e) =>
                            ts.isCallExpression(e) &&
                            ts.isIdentifier(e.expression) &&
                            e.expression.text === provideIdent,
                    );
                    if (!already) {
                        const newArr = ts.factory.updateArrayLiteralExpression(arr, [
                            ...arr.elements,
                            ts.factory.createCallExpression(ts.factory.createIdentifier(provideIdent), undefined, []),
                        ]);
                        newSecond = ts.factory.updateObjectLiteralExpression(
                            second,
                            second.properties.map((p) =>
                                p === providersProp
                                    ? ts.factory.updatePropertyAssignment(providersProp, providersProp.name, newArr)
                                    : p,
                            ),
                        );
                    }
                }
            } else {
                newSecond = ts.factory.updateObjectLiteralExpression(second, [
                    ...second.properties,
                    ts.factory.createPropertyAssignment(
                        'providers',
                        ts.factory.createArrayLiteralExpression([
                            ts.factory.createCallExpression(ts.factory.createIdentifier(provideIdent), undefined, []),
                        ]),
                    ),
                ]);
            }
            const newCall = ts.factory.createCallExpression(bootstrapCall.expression, bootstrapCall.typeArguments, [
                args[0],
                newSecond,
                ...args.slice(2),
            ]);
            updatedMain = replaceRange(
                sourceText,
                bootstrapCall.getStart(),
                bootstrapCall.getEnd(),
                printer.printNode(ts.EmitHint.Unspecified, newCall, sf),
            );
            mutated = true;
        } else if (ts.isIdentifier(second)) {
            const identName = second.text;
            const resolved = resolveConfigIdentifier(tree, identName, context);
            if (resolved && !resolved.already) {
                tree.overwrite(resolved.path, resolved.text);
                context.logger.info(`[ng-add] Added provider to config ${identName} in ${resolved.path}`);
            } else if (!resolved) {
                context.logger.warn(`[ng-add] Could not resolve config identifier ${identName}.`);
            }
        }
    }

    if (mutated) {
        if (importNeeded) {
            const rel = computeRelativeSpecifier(mainPath, '/' + providerModulePathNoExt);
            updatedMain = `import { ${provideIdent} } from '${rel}';\n` + updatedMain;
        }
        tree.overwrite(mainPath, updatedMain);
        context.logger.info('[ng-add] Provider injected into main.ts');
    }
}

function resolveConfigIdentifier(
    tree: Tree,
    ident: string,
    _context: SchematicContext,
): { path: string; text: string; already: boolean } | undefined {
    const candidate = '/src/app/app.config.ts';
    if (!tree.exists(candidate)) return undefined;
    const buf = tree.read(candidate);
    if (!buf) return undefined;
    const text = buf.toString('utf8');
    const provideIdent = 'providePracticesTailwind';
    if (new RegExp(provideIdent).test(text)) {
        return { path: candidate, text, already: true };
    }
    const sf = ts.createSourceFile(candidate, text, ts.ScriptTarget.Latest, true);
    const printer = ts.createPrinter();
    let mutated = false;
    let newText = text;
    sf.forEachChild((node) => {
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((d) => {
                if (
                    ts.isIdentifier(d.name) &&
                    d.name.text === ident &&
                    d.initializer &&
                    ts.isObjectLiteralExpression(d.initializer)
                ) {
                    const obj = d.initializer;
                    const providersProp = obj.properties.find(
                        (p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'providers',
                    ) as ts.PropertyAssignment | undefined;
                    let newObj = obj;
                    if (providersProp && ts.isArrayLiteralExpression(providersProp.initializer)) {
                        const arr = providersProp.initializer;
                        const already = arr.elements.some(
                            (e) =>
                                ts.isCallExpression(e) &&
                                ts.isIdentifier(e.expression) &&
                                e.expression.text === provideIdent,
                        );
                        if (!already) {
                            const newArr = ts.factory.updateArrayLiteralExpression(arr, [
                                ...arr.elements,
                                ts.factory.createCallExpression(
                                    ts.factory.createIdentifier(provideIdent),
                                    undefined,
                                    [],
                                ),
                            ]);
                            newObj = ts.factory.updateObjectLiteralExpression(
                                obj,
                                obj.properties.map((p) =>
                                    p === providersProp
                                        ? ts.factory.updatePropertyAssignment(providersProp, providersProp.name, newArr)
                                        : p,
                                ),
                            );
                        } else {
                            mutated = false;
                            return;
                        }
                    } else {
                        newObj = ts.factory.updateObjectLiteralExpression(obj, [
                            ...obj.properties,
                            ts.factory.createPropertyAssignment(
                                'providers',
                                ts.factory.createArrayLiteralExpression([
                                    ts.factory.createCallExpression(
                                        ts.factory.createIdentifier(provideIdent),
                                        undefined,
                                        [],
                                    ),
                                ]),
                            ),
                        ]);
                    }
                    const varDeclList = node.declarationList;
                    const newDecls = varDeclList.declarations.map((orig) =>
                        orig === d
                            ? ts.factory.updateVariableDeclaration(d, d.name, d.exclamationToken, d.type, newObj)
                            : orig,
                    );
                    const newDeclList = ts.factory.updateVariableDeclarationList(varDeclList, newDecls);
                    const newStmt = ts.factory.updateVariableStatement(node, node.modifiers, newDeclList);
                    newText = replaceRange(
                        text,
                        node.getStart(),
                        node.getEnd(),
                        printer.printNode(ts.EmitHint.Unspecified, newStmt, sf),
                    );
                    mutated = true;
                }
            });
        }
    });
    if (mutated) {
        if (!new RegExp(`import[^;]+providePracticesTailwind`).test(newText)) {
            const hashDb = readHashDb(tree);
            const destRoot = hashDb.dest || 'src/practices-ui-tailwind';
            const providerModulePathNoExt = `${destRoot.replace(/\\/g, '/')}/lib/providers/practices-tailwind.providers`;
            const rel = computeRelativeSpecifier(candidate, '/' + providerModulePathNoExt);
            newText = `import { providePracticesTailwind } from '${rel}';\n` + newText;
        }
        return { path: candidate, text: newText, already: false };
    }
    return undefined;
}

function replaceRange(text: string, start: number, end: number, replacement: string): string {
    return text.slice(0, start) + replacement + text.slice(end);
}

function logTutorial(themes: string[], chosen: string, provider: boolean): Rule {
    return (_tree: Tree, context: SchematicContext) => {
        context.logger.info('[ng-add] Installation summary:');
        context.logger.info(`  Theme: ${chosen}`);
        if (provider) context.logger.info('  Provider injected: providePracticesTailwind');
        context.logger.info('  Next steps:');
        context.logger.info('    - Add components: ng g @nexplore/practices-ui-tailwind:add-component --names button');
        context.logger.info('    - Update components: ng g @nexplore/practices-ui-tailwind:update-components');
        context.logger.info(`    - Switch theme: rerun or edit import to one of: ${themes.join(', ')}`);
        return _tree;
    };
}

// Compute module specifier from a source file to a target (both with leading /) without extension.
function computeRelativeSpecifier(fromAbs: string, toAbsNoExt: string): string {
    // Normalize leading slashes
    if (!fromAbs.startsWith('/')) fromAbs = '/' + fromAbs;
    if (!toAbsNoExt.startsWith('/')) toAbsNoExt = '/' + toAbsNoExt;
    const fromDir = fromAbs.substring(0, fromAbs.lastIndexOf('/'));
    const fromParts = fromDir.split('/').filter(Boolean);
    const toParts = toAbsNoExt.split('/').filter(Boolean);
    // Find common prefix
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) i++;
    const up = fromParts.length - i;
    const down = toParts.slice(i).join('/');
    const rel = (up ? new Array(up).fill('..').join('/') + (down ? '/' : '') : '.') + down;
    return rel.startsWith('.') ? rel : './' + rel;
}

// Add @import statement to the primary global styles file (from angular.json) for the generated theme file
function addThemeImport(tree: Tree, context: SchematicContext, theme: string, destRoot: string) {
    const angularJsonPath = '/angular.json';
    if (!tree.exists(angularJsonPath)) return;
    const buf = tree.read(angularJsonPath);
    if (!buf) return;
    let angularConfig: { projects?: Record<string, unknown> } | undefined;
    try {
        angularConfig = JSON.parse(buf.toString('utf8'));
    } catch (_err) {
        return;
    }
    const styleFilePath = findAndCacheGlobalStylesEntry(tree);
    if (!styleFilePath) return;
    if (!tree.exists(styleFilePath)) return;
    const styleBuf = tree.read(styleFilePath);
    if (!styleBuf) return;
    const styleContent = styleBuf.toString('utf8');
    const themeFilePath = `/${destRoot.replace(/\\/g, '/')}/${theme}`;
    const rel = path.posix.relative(path.posix.dirname(styleFilePath), themeFilePath) || themeFilePath;
    let relImport = rel;
    if (!relImport.startsWith('.') && !relImport.startsWith('/')) relImport = './' + relImport;
    if (styleContent.includes(themeFilePath) || styleContent.includes(relImport)) return;
    const importLine = `@import '${relImport}';\n`;
    tree.overwrite(styleFilePath, importLine + styleContent);
    context.logger.info(`[ng-add] Inserted @import for theme (${relImport}) into ${styleFilePath}`);
}

// moved to _utils/styles-entry.ts

