import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as path from 'path';

const collectionPath = path.join(__dirname, '..', 'collection.json');

function seedTree(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'v1',
        components: {
            button: { files: ['src/lib/button/button.directive.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest, null, 2));
    // Packaged snapshot source (original)
    host.create('/schematics/add-component/files/src/lib/button/button.directive.ts', 'export const BTN = 1;');
    return new UnitTestTree(host);
}

function readJson(tree: UnitTestTree, file: string) {
    return JSON.parse(tree.readContent(file));
}

describe('update-components schematic', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('updates a modified file when snapshot changes', async () => {
        let tree = seedTree();
        // First add-component run to populate dest + hash db
        tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            tree,
        );
        // Simulate packaged snapshot update (new content)
        tree.overwrite(
            '/schematics/add-component/files/src/lib/button/button.directive.ts',
            'export const BTN = 2; // updated',
        );
        // Run update-components selecting button
        tree = await runner.runSchematic('update-components', { names: 'button' }, tree);
        const updatedPath = '/src/app/ui/lib/button/button.directive.ts';
        const content = tree.readContent(updatedPath);
        expect(content).toContain('BTN = 2');
        const db = readJson(tree as any, '/.practices-ui/schematics.hashdb.json');
        expect(db.runs.length).toBe(2); // add + update
        const entry = db.files[updatedPath];
        expect(entry.hash).toBeDefined();
    });

    it('skips unchanged file when snapshot identical', async () => {
        let tree = seedTree();
        tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            tree,
        );
        // Without modifying packaged snapshot run update
        tree = await runner.runSchematic('update-components', { names: 'button' }, tree);
        const db = readJson(tree as any, '/.practices-ui/schematics.hashdb.json');
        expect(db.runs.length).toBe(2);
        // Verify file content still original
        const content = tree.readContent('/src/app/ui/lib/button/button.directive.ts');
        expect(content).toContain('BTN = 1');
    });
});

