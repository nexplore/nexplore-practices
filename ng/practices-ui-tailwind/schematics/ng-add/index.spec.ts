import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as path from 'path';

const collectionPath = path.join(__dirname, '..', 'collection.json');

const MAIN_TS = [
    "import { bootstrapApplication } from '@angular/platform-browser';",
    "import { appConfig } from './app/app.config';",
    "import { App } from './app/app';",
    '',
    'bootstrapApplication(App, appConfig).catch((err) => console.error(err));',
    '',
].join('\n');

const APP_CONFIG = [
    "import { ApplicationConfig } from '@angular/core';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [],',
    '};',
    '',
].join('\n');

interface SeedOptions {
    styles?: unknown[];
    styleFiles?: Record<string, string>;
    postcss?: unknown;
    devDependencies?: Record<string, string>;
}

function angularJson(styles: unknown[] | undefined) {
    return {
        version: 1,
        projects: {
            app: {
                projectType: 'application',
                root: '',
                sourceRoot: 'src',
                architect: {
                    build: { builder: '@angular/build:application', options: styles ? { styles } : {} },
                },
            },
        },
    };
}

function seed(opts: SeedOptions = {}): UnitTestTree {
    const host = new HostTree();
    const styles = 'styles' in opts ? opts.styles : ['src/styles.css'];
    host.create('/angular.json', JSON.stringify(angularJson(styles), null, 2));
    host.create(
        '/package.json',
        JSON.stringify({ name: 'app', version: '0.0.0', dependencies: {}, devDependencies: opts.devDependencies ?? {} }),
    );
    host.create('/src/main.ts', MAIN_TS);
    host.create('/src/app/app.config.ts', APP_CONFIG);
    const styleFiles = opts.styleFiles ?? { '/src/styles.css': '/* global styles */\n' };
    Object.entries(styleFiles).forEach(([file, content]) => host.create(file, content));
    if (opts.postcss) host.create('/.postcssrc.json', JSON.stringify(opts.postcss));

    // Snapshot of the library as it is shipped with the schematics
    host.create(
        '/schematics/add-component/files/component-manifest.json',
        JSON.stringify({
            version: 'test',
            components: {
                shell: { files: ['src/lib/shell/shell.ts'], deps: [], externalDependencies: [] },
                providers: { files: ['src/lib/providers/practices-tailwind.providers.ts'], deps: [], externalDependencies: [] },
            },
            groups: {},
            externalDependencyVersions: {},
        }),
    );
    host.create('/schematics/add-component/files/src/lib/shell/shell.ts', 'export const SHELL = 1;');
    host.create(
        '/schematics/add-component/files/src/lib/providers/practices-tailwind.providers.ts',
        'export function providePracticesTailwind() { return []; }',
    );
    host.create('/schematics/add-component/files/src/theme.css', '@theme { --color-brand: red; }');
    host.create('/schematics/add-component/files/src/theme-nexplore.css', '@theme { --color-brand: blue; }');
    host.create('/schematics/add-component/files/src/tailwind.css', '@layer base { a { color: red; } }');
    return new UnitTestTree(host);
}

const readJson = (tree: UnitTestTree, file: string) => JSON.parse(tree.readContent(file));

describe('ng-add schematic', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    describe('Tailwind CSS setup of an app with a CSS stylesheet', () => {
        it('imports Tailwind, theme and library styles and registers the package as @source', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed());

            const styles = tree.readContent('/src/styles.css');
            expect(styles).toContain("@import 'tailwindcss';");
            expect(styles).toContain("@import './practices-ui-tailwind/theme.css';");
            expect(styles).toContain("@import './practices-ui-tailwind/tailwind.css';");
            expect(styles).toContain("@source '../node_modules/@nexplore/practices-ui-tailwind';");
            // Tailwind first, the app's own styles keep their place below
            expect(styles.indexOf("@import 'tailwindcss'")).toBeLessThan(styles.indexOf('/* global styles */'));
            expect(styles.indexOf("@import 'tailwindcss'")).toBeLessThan(styles.indexOf('theme.css'));
            expect(tree.exists('/src/practices-ui-tailwind/theme.css')).toBe(true);
            expect(tree.exists('/src/practices-ui-tailwind/tailwind.css')).toBe(true);
        });

        it('adds the PostCSS plugin and the Tailwind packages and schedules an install', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed());

            expect(readJson(tree, '/.postcssrc.json')).toEqual({ plugins: { '@tailwindcss/postcss': {} } });
            const pkg = readJson(tree, '/package.json');
            expect(Object.keys(pkg.devDependencies)).toEqual(['@tailwindcss/postcss', 'postcss', 'tailwindcss']);
            expect(pkg.devDependencies.tailwindcss).toMatch(/^\^4\./);
            expect(runner.tasks.map((t) => t.name)).toContain('node-package');
        });

        it('keeps packages the app already has and does not schedule an install if nothing is missing', async () => {
            const tree = await runner.runSchematic(
                'ng-add',
                {},
                seed({
                    devDependencies: { tailwindcss: '^4.2.0', '@tailwindcss/postcss': '^4.2.0', postcss: '^8.5.6' },
                }),
            );

            expect(readJson(tree, '/package.json').devDependencies.tailwindcss).toBe('^4.2.0');
            expect(runner.tasks.map((t) => t.name)).not.toContain('node-package');
        });

        it('is idempotent when it is run again', async () => {
            const first = await runner.runSchematic('ng-add', {}, seed());
            const stylesAfterFirst = first.readContent('/src/styles.css');
            const postcssAfterFirst = first.readContent('/.postcssrc.json');
            const packageAfterFirst = first.readContent('/package.json');
            const mainAfterFirst = first.readContent('/src/main.ts');
            const configAfterFirst = first.readContent('/src/app/app.config.ts');

            const second = await runner.runSchematic('ng-add', {}, first);

            expect(second.readContent('/src/styles.css')).toBe(stylesAfterFirst);
            expect(second.readContent('/.postcssrc.json')).toBe(postcssAfterFirst);
            expect(second.readContent('/package.json')).toBe(packageAfterFirst);
            expect(second.readContent('/src/main.ts')).toBe(mainAfterFirst);
            expect(second.readContent('/src/app/app.config.ts')).toBe(configAfterFirst);
            expect(stylesAfterFirst.match(/@import 'tailwindcss'/g)).toHaveLength(1);
        });

        it('recognizes the setup if the app wrote it by hand', async () => {
            const tree = await runner.runSchematic(
                'ng-add',
                {},
                seed({
                    styleFiles: {
                        '/src/styles.css':
                            '@import "tailwindcss";\n@import "./practices-ui-tailwind/theme.css";\n@source "../node_modules/@nexplore/practices-ui-tailwind";\nbody { margin: 0; }\n',
                    },
                }),
            );

            const styles = tree.readContent('/src/styles.css');
            expect(styles.match(/tailwindcss['"]/g)).toHaveLength(1);
            expect(styles.match(/theme\.css/g)).toHaveLength(1);
            expect(styles.match(/@source/g)).toHaveLength(1);
            expect(styles).toContain("@import './practices-ui-tailwind/tailwind.css';");
        });

        it('uses the requested theme', async () => {
            const tree = await runner.runSchematic('ng-add', { theme: 'theme-nexplore.css' }, seed());

            expect(tree.readContent('/src/styles.css')).toContain("@import './practices-ui-tailwind/theme-nexplore.css';");
            expect(tree.exists('/src/practices-ui-tailwind/theme-nexplore.css')).toBe(true);
        });
    });

    describe('PostCSS configuration', () => {
        it('adds the plugin to an existing configuration and keeps the other plugins', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed({ postcss: { plugins: { autoprefixer: {} } } }));

            expect(readJson(tree, '/.postcssrc.json')).toEqual({
                plugins: { autoprefixer: {}, '@tailwindcss/postcss': {} },
            });
        });

        it('leaves a configuration that already contains the plugin untouched', async () => {
            const tree = await runner.runSchematic(
                'ng-add',
                {},
                seed({ postcss: { plugins: { '@tailwindcss/postcss': { optimize: false } } } }),
            );

            expect(readJson(tree, '/.postcssrc.json')).toEqual({
                plugins: { '@tailwindcss/postcss': { optimize: false } },
            });
        });
    });

    describe('app without a usable styles file', () => {
        it('creates and registers src/styles.css if no styles are configured', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed({ styles: [], styleFiles: {} }));

            expect(tree.exists('/src/styles.css')).toBe(true);
            expect(tree.readContent('/src/styles.css')).toContain("@import 'tailwindcss';");
            expect(readJson(tree, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/styles.css',
            ]);
            expect(readJson(tree, '/.practices-ui/schematics.hashdb.json').globalStylesEntry).toBe('/src/styles.css');
        });

        it('creates and registers src/styles.css if the build has no styles option at all', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed({ styles: undefined, styleFiles: {} }));

            expect(readJson(tree, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/styles.css',
            ]);
            expect(tree.readContent('/src/styles.css')).toContain("@import 'tailwindcss';");
        });

        it('creates a configured stylesheet that does not exist yet', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed({ styleFiles: {} }));

            expect(tree.readContent('/src/styles.css')).toContain("@import 'tailwindcss';");
            expect(readJson(tree, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/styles.css',
            ]);
        });

        it('does not register the stylesheet twice when run again', async () => {
            const first = await runner.runSchematic('ng-add', {}, seed({ styles: [], styleFiles: {} }));
            const second = await runner.runSchematic('ng-add', {}, first);

            expect(readJson(second, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/styles.css',
            ]);
        });
    });

    describe('app with a Sass stylesheet', () => {
        const sassApp = () =>
            seed({ styles: ['src/styles.scss'], styleFiles: { '/src/styles.scss': '$c: red;\nbody { color: $c; }\n' } });

        it('leaves the Sass file alone and registers a dedicated CSS entry in front of it', async () => {
            const tree = await runner.runSchematic('ng-add', {}, sassApp());

            expect(tree.readContent('/src/styles.scss')).toBe('$c: red;\nbody { color: $c; }\n');
            const entry = tree.readContent('/src/practices-ui-tailwind/styles.css');
            expect(entry).toContain("@import 'tailwindcss';");
            expect(entry).toContain("@import './theme.css';");
            expect(entry).toContain("@import './tailwind.css';");
            expect(entry).toContain("@source '../../node_modules/@nexplore/practices-ui-tailwind';");
            expect(readJson(tree, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/practices-ui-tailwind/styles.css',
                'src/styles.scss',
            ]);
        });

        it('points @reference of copied components to the CSS entry', async () => {
            const tree = await runner.runSchematic('ng-add', {}, sassApp());

            expect(readJson(tree, '/.practices-ui/schematics.hashdb.json').globalStylesEntry).toBe(
                '/src/practices-ui-tailwind/styles.css',
            );
        });

        it('is idempotent when it is run again', async () => {
            const first = await runner.runSchematic('ng-add', {}, sassApp());
            const second = await runner.runSchematic('ng-add', {}, first);

            expect(second.readContent('/src/practices-ui-tailwind/styles.css')).toBe(
                first.readContent('/src/practices-ui-tailwind/styles.css'),
            );
            expect(readJson(second, '/angular.json').projects.app.architect.build.options.styles).toEqual([
                'src/practices-ui-tailwind/styles.css',
                'src/styles.scss',
            ]);
        });
    });

    describe('features', () => {
        it('adds the shell and the provider by default, also without a prompt (non-interactive)', async () => {
            const tree = await runner.runSchematic('ng-add', {}, seed());

            expect(tree.exists('/src/practices-ui-tailwind/lib/shell/shell.ts')).toBe(true);
            expect(tree.exists('/src/practices-ui-tailwind/lib/providers/practices-tailwind.providers.ts')).toBe(true);
            expect(tree.readContent('/src/app/app.config.ts')).toContain('providePracticesTailwind()');
        });

        it('does not touch the app config with skipProvider', async () => {
            const tree = await runner.runSchematic('ng-add', { skipProvider: true }, seed());

            expect(tree.readContent('/src/app/app.config.ts')).not.toContain('providePracticesTailwind');
        });
    });
});
