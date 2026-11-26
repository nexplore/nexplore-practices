import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as path from 'path';

const collectionPath = path.join(__dirname, '..', 'collection.json');

function seedTree(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'v1',
        components: {
            button: { files: ['src/lib/button/button.ts'], deps: [] },
            badge: { files: ['src/lib/badge/badge.ts'], deps: [] },
            unused: { files: ['src/lib/unused/unused.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest));
    host.create('/schematics/add-component/files/src/lib/button/button.ts', 'export const BUTTON = 1;');
    host.create('/schematics/add-component/files/src/lib/badge/badge.ts', 'export const BADGE = 1;');
    host.create('/schematics/add-component/files/src/lib/unused/unused.ts', 'export const UNUSED = 1;');
    return new UnitTestTree(host);
}

describe('update-components without a selection', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('updates every component that was added before, and only those', async () => {
        let tree = await runner.runSchematic(
            'add-component',
            { names: 'button,badge', dest: 'src/app/ui', rewriteImports: false },
            seedTree(),
        );
        for (const name of ['button', 'badge', 'unused']) {
            tree.overwrite(
                `/schematics/add-component/files/src/lib/${name}/${name}.ts`,
                `export const ${name.toUpperCase()} = 2;`,
            );
        }

        // No names/all/moduleExports: the README promises "all previously installed components"
        tree = await runner.runSchematic('update-components', {}, tree);

        expect(tree.readContent('/src/app/ui/lib/button/button.ts')).toContain('= 2');
        expect(tree.readContent('/src/app/ui/lib/badge/badge.ts')).toContain('= 2');
        expect(tree.exists('/src/app/ui/lib/unused/unused.ts')).toBe(false);
    });

    it('does nothing, with a warning, if nothing was added before', async () => {
        const messages: string[] = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));

        const tree = await runner.runSchematic('update-components', {}, seedTree());

        expect(tree.files.filter((f) => f.startsWith('/src/'))).toEqual([]);
        expect(messages.join('\n')).toMatch(/Hash DB missing dest|No components selected/);
    });
});

describe('add-component destination', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('keeps the destination of an earlier run if no dest is passed', async () => {
        let tree = await runner.runSchematic(
            'add-component',
            { names: 'button', dest: 'src/app/ui', rewriteImports: false },
            seedTree(),
        );

        tree = await runner.runSchematic('add-component', { names: 'badge', rewriteImports: false }, tree);

        expect(tree.exists('/src/app/ui/lib/badge/badge.ts')).toBe(true);
        expect(tree.exists('/src/practices-ui-tailwind/lib/badge/badge.ts')).toBe(false);
    });
});
