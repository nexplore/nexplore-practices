import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as path from 'path';

// Points to compiled collection when tests run via ts-jest or ts-node in source.
const collectionPath = path.join(__dirname, '..', 'collection.json');

function baseTree(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'test',
        components: {
            button: { files: ['src/lib/button/button.directive.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest, null, 2));
    host.create('/schematics/add-component/files/src/lib/button/button.directive.ts', 'export const BTN = 1;');
    return new UnitTestTree(host);
}

function readJson(tree: UnitTestTree, file: string) {
    return JSON.parse(tree.readContent(file));
}

describe('add-component schematic', () => {
    let runner: SchematicTestRunner;

    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('creates files and hash db for a single component', async () => {
        const seed = baseTree();
        const tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            seed,
        );
        // Expect at least one known file path based on manifest shape (no namespace folder now)
        const createdFiles = tree.files.filter((f) => f.startsWith('/src/app/ui/lib/button/'));
        expect(createdFiles.length).toBeGreaterThan(0);
        expect(tree.exists('/.practices-ui/schematics.hashdb.json')).toBe(true);
        const db = readJson(tree as any, '/.practices-ui/schematics.hashdb.json');
        expect(db.files).toBeDefined();
        const someEntry = Object.keys(db.files).find((k) => k.includes('button'));
        expect(someEntry).toBeTruthy();
    });

    it('is idempotent on second run (no duplicate writes)', async () => {
        const seed = baseTree();
        let tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            seed,
        );
        const initialFiles = tree.files;
        tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            tree,
        );
        const afterFiles = tree.files;
        expect(afterFiles.length).toEqual(initialFiles.length); // nothing new added
        const db = readJson(tree as any, '/.practices-ui/schematics.hashdb.json');
        expect(db.runs.length).toBe(2);
    });

    it('records conflict without overwriting', async () => {
        // First run to create
        const seed = baseTree();
        let tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            seed,
        );
        // Pick an existing file and modify it
        const targetFile =
            tree.files.find((f) => f.endsWith('/button/button.directive.ts')) ||
            tree.files.find((f) => f.includes('/button/'))!;
        const original = tree.readContent(targetFile);
        tree.overwrite(targetFile, original + '\n// user change');
        // Second run triggers conflict detection
        tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            tree,
        );
        const after = tree.readContent(targetFile);
        expect(after).toContain('// user change'); // ensure not overwritten
        const db = readJson(tree as any, '/.practices-ui/schematics.hashdb.json');
        expect(db.runs.length).toBe(2);
        const expectedKey = '/src/app/ui/lib/button/button.directive.ts';
        expect(db.files[expectedKey]).toBeDefined();
    });

    it('uses default destination when dest omitted', async () => {
        const seed = baseTree();
        const tree = await runner.runSchematic('add-component', { names: 'button', rewriteImports: false }, seed);
        const expectedFilePrefix = '/src/practices-ui-tailwind/lib/button/';
        const file = tree.files.find((f) => f.startsWith(expectedFilePrefix));
        expect(file).toBeTruthy();
    });
});

