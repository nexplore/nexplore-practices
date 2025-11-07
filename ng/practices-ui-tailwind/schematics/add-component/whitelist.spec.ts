import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as path from 'path';

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
    // Component file importing root module and styles (should be whitelisted) and a stories file (should NOT be whitelisted)
    host.create(
        '/schematics/add-component/files/src/lib/button/button.directive.ts',
        [
            "import '../../form.module';",
            "import '../../styles.css';",
            '// stories import should be ignored (not whitelisted)',
            "import '../../button.stories';",
            'export const BTN = 1;',
            '',
        ].join('\n'),
    );
    // Whitelisted root files
    host.create('/schematics/add-component/files/src/form.module.ts', 'export const FORM = 1;');
    host.create('/schematics/add-component/files/src/styles.css', '.root { }');
    // Non-whitelisted story file
    host.create('/schematics/add-component/files/src/button.stories.ts', 'export const story = {};');
    return new UnitTestTree(host);
}

describe('add-component whitelist behavior', () => {
    let runner: SchematicTestRunner;
    let tree: UnitTestTree;
    let dbFiles: string[] = [];

    beforeAll(async () => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
        const seed = baseTree();
        tree = await runner.runSchematic('add-component', { names: 'button', rewriteImports: true }, seed);
        const dbBuf = tree.read('/.practices-ui/schematics.hashdb.json');
        if (dbBuf) {
            const db = JSON.parse(dbBuf.toString('utf8'));
            dbFiles = Object.keys(db.files || {});
        }
    });

    it('component file copied', () => {
        const compFile = tree.files.find((f) => f.endsWith('/lib/button/button.directive.ts'));
        expect(!!compFile).toBe(true);
    });

    it('form.module.ts copied', () => {
        expect(tree.exists('/src/practices-ui-tailwind/form.module.ts')).toBe(true);
    });

    it('styles.css copied', () => {
        expect(tree.exists('/src/practices-ui-tailwind/styles.css')).toBe(true);
    });

    it('stories file not copied', () => {
        expect(tree.exists('/src/practices-ui-tailwind/button.stories.ts')).toBe(false);
    });

    it('hash db includes form.module.ts', () => {
        expect(dbFiles.includes('/src/practices-ui-tailwind/form.module.ts')).toBe(true);
    });

    it('hash db includes styles.css', () => {
        expect(dbFiles.includes('/src/practices-ui-tailwind/styles.css')).toBe(true);
    });

    it('hash db does not include stories file', () => {
        expect(dbFiles.includes('/src/practices-ui-tailwind/button.stories.ts')).toBe(false);
    });
});

