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
            util: { files: ['src/lib/util/util.ts'], deps: [] },
            consumer: { files: ['src/lib/consumer/consumer.component.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest, null, 2));
    host.create('/schematics/add-component/files/src/lib/util/util.ts', 'export const helper = () => 1;');
    host.create(
        '/schematics/add-component/files/src/lib/consumer/consumer.component.ts',
        "import { helper } from '@nexplore/practices-ui-tailwind';\nexport const value = helper();",
    );
    return new UnitTestTree(host);
}

describe('add-component schematic (import rewrite)', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('rewrites library import to relative path', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            { names: 'consumer,util', dest: 'src/app/ui', rewriteImports: true },
            seed(),
        );
        const content = tree.readContent('/src/app/ui/lib/consumer/consumer.component.ts');
        expect(content).not.toContain('@nexplore/practices-ui-tailwind');
        // Expect some relative import (starts with ./ or ../) now present
        expect(content).toMatch(/from ['"]\.{1,2}\//);
    });
});

