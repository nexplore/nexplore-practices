import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as path from 'path';

const collectionPath = path.join(__dirname, '..', 'collection.json');

function seed(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'v1',
        components: {
            button: { files: ['src/lib/button/button.directive.ts'], deps: [] },
            card: { files: ['src/lib/card/card.component.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest, null, 2));
    host.create('/schematics/add-component/files/src/lib/button/button.directive.ts', 'export const BTN = 1;');
    host.create('/schematics/add-component/files/src/lib/card/card.component.ts', 'export const CARD = 1;');
    return new UnitTestTree(host);
}

describe('add-component schematic (all selection)', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('creates both components when all:true', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            { all: true, dest: 'src/app/ui', rewriteImports: false },
            seed(),
        );
        expect(tree.exists('/src/app/ui/lib/button/button.directive.ts')).toBe(true);
        expect(tree.exists('/src/app/ui/lib/card/card.component.ts')).toBe(true);
    });
});

