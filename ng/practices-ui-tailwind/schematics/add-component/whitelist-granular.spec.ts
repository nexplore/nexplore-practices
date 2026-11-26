import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as path from 'path';
import { getWhitelistPatterns, isWhitelisted } from '../_utils/whitelist';

const collectionPath = path.join(__dirname, '..', 'collection.json');

function makeTree(files: Record<string, string>): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'test',
        components: {
            button: { files: ['src/lib/button/button.directive.ts'], deps: [] },
        },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest, null, 2));
    for (const [rel, content] of Object.entries(files)) {
        host.create('/schematics/add-component/files/' + rel, content);
    }
    return new UnitTestTree(host);
}

describe('whitelist granular', () => {
    let runner: SchematicTestRunner;
    let patterns: string[] = [];
    const whitelistChecks: Record<string, boolean> = {};
    let result: UnitTestTree;

    beforeAll(async () => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
        patterns = getWhitelistPatterns();
        const samples: Record<string, string> = {
            'src/lib/x/file.ts': 'true',
            'src/styles.css': 'true',
            'src/app.module.ts': 'true',
            'src/feature.module.ts': 'true',
            'src/feature.stories.ts': 'false',
            'src/README.md': 'false',
        };
        Object.keys(samples).forEach((k) => (whitelistChecks[k] = isWhitelisted(k)));
        const tree = makeTree({
            'src/lib/button/button.directive.ts': [
                "import '../../app.module';",
                "import '../../styles.css';",
                'export const BTN = 1;',
            ].join('\n'),
            'src/app.module.ts': 'export const APP = 1;',
            'src/styles.css': '.root{}',
        });
        result = await runner.runSchematic('add-component', { names: 'button', rewriteImports: true }, tree);
    });

    it('patterns include baseline', () => {
        expect(patterns.includes('lib/**') && patterns.includes('*.module.ts') && patterns.includes('styles.css')).toBe(
            true,
        );
    });

    it('whitelist lib file', () => {
        expect(whitelistChecks['src/lib/x/file.ts']).toBe(true);
    });
    it('whitelist styles.css', () => {
        expect(whitelistChecks['src/styles.css']).toBe(true);
    });
    it('whitelist app.module.ts', () => {
        expect(whitelistChecks['src/app.module.ts']).toBe(true);
    });
    it('whitelist feature.module.ts', () => {
        expect(whitelistChecks['src/feature.module.ts']).toBe(true);
    });
    it('exclude feature.stories.ts', () => {
        expect(whitelistChecks['src/feature.stories.ts']).toBe(false);
    });
    it('exclude README.md', () => {
        expect(whitelistChecks['src/README.md']).toBe(false);
    });

    it('copied component file', () => {
        expect(result.exists('/src/practices-ui-tailwind/lib/button/button.directive.ts')).toBe(true);
    });
    it('copied root app.module.ts', () => {
        expect(result.exists('/src/practices-ui-tailwind/app.module.ts')).toBe(true);
    });
    it('copied root styles.css', () => {
        expect(result.exists('/src/practices-ui-tailwind/styles.css')).toBe(true);
    });
});

