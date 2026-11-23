import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as path from 'path';
import { ComponentManifest, resolveExternalDependencyVersion } from '../_utils/manifest';

const collectionPath = path.join(__dirname, '..', 'collection.json');
const addOptions = { names: 'widget', dest: 'src/app/ui', rewriteImports: false };

function seed(externalDependencyVersions: Record<string, string>): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'test',
        components: {
            widget: {
                files: ['src/lib/widget/widget.ts'],
                deps: [],
                externalDependencies: ['@nexplore/practices-ui', '@nexplore/practices-ng-forms'],
            },
        },
        groups: {},
        externalDependencyVersions,
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest));
    host.create('/schematics/add-component/files/src/lib/widget/widget.ts', 'export const WIDGET = 1;');
    host.create('/package.json', JSON.stringify({ name: 'app', version: '4.2.0', dependencies: {} }));
    return new UnitTestTree(host);
}

describe('external dependencies of copied components', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('never writes the placeholder version "?" into the package.json of the app', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            addOptions,
            seed({ '@nexplore/practices-ui': '?', '@nexplore/practices-ng-forms': '?' }),
        );

        const raw = tree.readContent('/package.json');
        expect(raw).not.toContain('"?"');
        expect(raw).not.toContain('VERSION');
    });

    it('adds dependencies with a known version', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            addOptions,
            seed({ '@nexplore/practices-ui': '^13.0.0', '@nexplore/practices-ng-forms': '^13.0.0' }),
        );

        const pkg = JSON.parse(tree.readContent('/package.json'));
        expect(pkg.dependencies['@nexplore/practices-ui']).toBe('^13.0.0');
        expect(pkg.dependencies['@nexplore/practices-ng-forms']).toBe('^13.0.0');
    });

    it('records the version of the library, not the version of the app, in the hash db', async () => {
        const tree = await runner.runSchematic('add-component', addOptions, seed({}));

        const db = JSON.parse(tree.readContent('/.practices-ui/schematics.hashdb.json'));
        expect(db.libVersion).not.toBe('4.2.0');
    });
});

describe('resolveExternalDependencyVersion', () => {
    const manifest = (versions: Record<string, string>): ComponentManifest => ({
        version: 'test',
        components: {},
        groups: {},
        externalDependencyVersions: versions,
    });

    it('takes a concrete version from the manifest', () => {
        expect(resolveExternalDependencyVersion(manifest({ a: '^1.0.0' }), 'a', {})).toBe('^1.0.0');
    });

    it('falls back to the peer dependencies of the library for "?"', () => {
        expect(resolveExternalDependencyVersion(manifest({ a: '?' }), 'a', { peerDependencies: { a: '99.0.1' } })).toBe(
            '99.0.1',
        );
    });

    it('falls back to the dependencies of the library', () => {
        expect(resolveExternalDependencyVersion(manifest({}), 'a', { dependencies: { a: '^2.0.0' } })).toBe('^2.0.0');
    });

    it('does not return unresolved placeholders', () => {
        expect(resolveExternalDependencyVersion(manifest({ a: '?' }), 'a', {})).toBeUndefined();
        expect(
            resolveExternalDependencyVersion(manifest({}), 'a', { peerDependencies: { a: '0.0.0-VERSION' } }),
        ).toBeUndefined();
    });
});
