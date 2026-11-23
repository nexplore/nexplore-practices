import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as path from 'path';
import { findResourceReferences } from '../_utils/plan';
import { isExcluded, isWhitelisted } from '../_utils/whitelist';

const collectionPath = path.join(__dirname, '..', 'collection.json');

const FILES: Record<string, string> = {
    // `card` only imports a single file of `badge`, not the whole component
    'src/lib/card/card.component.ts': [
        "import { Component } from '@angular/core';",
        "import { PuiBadgeComponent } from '../badge/badge.component';",
        "@Component({ selector: 'pui-card', templateUrl: './card.component.html' })",
        'export class PuiCardComponent {}',
    ].join('\n'),
    'src/lib/card/card.component.html': '<pui-badge></pui-badge>',
    'src/lib/card/card.stories.ts': "export default { title: 'Card' };",
    'src/lib/card/card.component.spec.ts': "describe('card', () => {});",
    // `badge` is discovered through the import above and has its own template and stylesheet
    'src/lib/badge/badge.component.ts': [
        "import { Component } from '@angular/core';",
        "import { helper } from '../util/helper';",
        "@Component({ selector: 'pui-badge', templateUrl: './badge.component.html', styleUrls: ['./badge.component.css'] })",
        'export class PuiBadgeComponent { x = helper; }',
    ].join('\n'),
    'src/lib/badge/badge.component.html': '<span>badge</span>',
    'src/lib/badge/badge.component.css': ':host { display: inline-block; }',
    'src/lib/badge/badge.stories.ts': "export default { title: 'Badge' };",
    'src/lib/util/helper.ts': 'export const helper = 1;',
    'src/lib/util/helper.spec.ts': "describe('helper', () => {});",
    'src/lib/util/spec/test-route-config.ts': 'export const routes = [];',
};

function seed(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'test',
        components: {
            // The manifest of an older release still lists stories and specs
            card: {
                files: [
                    'src/lib/card/card.component.ts',
                    'src/lib/card/card.component.html',
                    'src/lib/card/card.stories.ts',
                    'src/lib/card/card.component.spec.ts',
                ],
                deps: [],
                externalDependencies: [],
            },
        },
        groups: {},
        externalDependencyVersions: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest));
    for (const [file, content] of Object.entries(FILES)) {
        host.create('/schematics/add-component/files/' + file, content);
    }
    return new UnitTestTree(host);
}

describe('add-component planning', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('copies templates and styles of components that are only discovered through imports', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            { names: 'card', dest: 'src/app/ui', rewriteImports: true },
            seed(),
        );

        expect(tree.exists('/src/app/ui/lib/badge/badge.component.ts')).toBe(true);
        expect(tree.exists('/src/app/ui/lib/badge/badge.component.html')).toBe(true);
        expect(tree.exists('/src/app/ui/lib/badge/badge.component.css')).toBe(true);
        // and transitive imports of the discovered file
        expect(tree.exists('/src/app/ui/lib/util/helper.ts')).toBe(true);
    });

    it('never copies stories, specs and test fixtures, even if an old manifest lists them', async () => {
        const tree = await runner.runSchematic(
            'add-component',
            { names: 'card', dest: 'src/app/ui', rewriteImports: true },
            seed(),
        );

        const copied = tree.files.filter((f) => f.startsWith('/src/app/ui/'));
        expect(copied.filter((f) => /\.stories\.|\.spec\.|\/spec\//.test(f))).toEqual([]);
        expect(copied.length).toBeGreaterThan(0);
    });
});

describe('findResourceReferences', () => {
    it('finds templateUrl, styleUrl and styleUrls', () => {
        const source = `@Component({
            templateUrl: './a.component.html',
            styleUrl: "./a.component.css",
            styleUrls: ['./b.css', "../c.css"],
        })`;
        expect(findResourceReferences(source).sort()).toEqual(
            ['./a.component.html', './a.component.css', './b.css', '../c.css'].sort(),
        );
    });

    it('ignores inline templates and absolute urls', () => {
        expect(findResourceReferences("@Component({ template: '<p>x</p>', templateUrl: 'https://x/y.html' })")).toEqual(
            [],
        );
    });
});

describe('whitelist exclusions', () => {
    it.each([
        'src/lib/a/a.stories.ts',
        'src/lib/util/hide-if-empty-text.stories.with-entrance-animation.ts',
        'src/lib/a/a.component.spec.ts',
        'src/lib/util/spec/test-route-config.ts',
        'src/stories/Introduction.mdx',
    ])('excludes %s', (file) => {
        expect(isExcluded(file)).toBe(true);
        expect(isWhitelisted(file)).toBe(false);
    });

    it('keeps regular library files', () => {
        expect(isExcluded('src/lib/a/a.component.ts')).toBe(false);
        expect(isWhitelisted('src/lib/a/a.component.ts')).toBe(true);
    });
});
