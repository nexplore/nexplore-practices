import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import * as path from 'path';
import { contentHash, isSameContent, matchesRecordedHash, normalizeForCompare, sha256 } from '../_utils/hash-db';

const collectionPath = path.join(__dirname, '..', 'collection.json');

const PACKAGED_V1 = [
    "import { signal } from '@angular/core';",
    'export const COUNT = signal(1);',
    "export const NAMES = ['a', \"b\"];",
    '',
].join('\n');

// What the Prettier of the app turns the file into (other quotes, indentation, trailing comma, line breaks)
const FORMATTED_V1 = [
    'import { signal } from "@angular/core";',
    '',
    'export const COUNT = signal(1);',
    'export const NAMES = [',
    '    "a",',
    '    "b",',
    '];',
    '',
].join('\n');

function seedTree(): UnitTestTree {
    const host = new HostTree();
    const manifest = {
        version: 'v1',
        components: { counter: { files: ['src/lib/counter/counter.ts'], deps: [] } },
        groups: {},
    };
    host.create('/schematics/add-component/files/component-manifest.json', JSON.stringify(manifest));
    host.create('/schematics/add-component/files/src/lib/counter/counter.ts', PACKAGED_V1);
    return new UnitTestTree(host);
}

const target = '/src/app/ui/lib/counter/counter.ts';
const addOptions = { names: 'counter', dest: 'src/app/ui', rewriteImports: false };

describe('files that were formatted by the Angular CLI after the schematic ran', () => {
    let runner: SchematicTestRunner;
    beforeEach(() => {
        runner = new SchematicTestRunner('practices-ui-tailwind', collectionPath);
    });

    it('add-component reports them as identical instead of conflicts on a re-run', async () => {
        let tree = await runner.runSchematic('add-component', addOptions, seedTree());
        tree.overwrite(target, FORMATTED_V1);

        tree = await runner.runSchematic('add-component', addOptions, tree);

        const db = JSON.parse(tree.readContent('/.practices-ui/schematics.hashdb.json'));
        expect(db.runs[1].summary).toEqual({ created: 0, skippedIdentical: 1, skippedConflict: 0 });
        expect(tree.readContent(target)).toBe(FORMATTED_V1);
    });

    it('update-components still updates a formatted but otherwise untouched file', async () => {
        let tree = await runner.runSchematic('add-component', addOptions, seedTree());
        tree.overwrite(target, FORMATTED_V1);
        tree.overwrite(
            '/schematics/add-component/files/src/lib/counter/counter.ts',
            PACKAGED_V1.replace('signal(1)', 'signal(2)'),
        );

        tree = await runner.runSchematic('update-components', { names: 'counter' }, tree);

        expect(tree.readContent(target)).toContain('signal(2)');
        const db = JSON.parse(tree.readContent('/.practices-ui/schematics.hashdb.json'));
        expect(db.runs[1].summary).toEqual({ updated: 1, skippedConflict: 0, skippedNoRecord: 0 });
    });

    it('update-components keeps a file the developer changed, formatted or not', async () => {
        let tree = await runner.runSchematic('add-component', addOptions, seedTree());
        tree.overwrite(target, FORMATTED_V1.replace('signal(1)', 'signal(100)'));
        tree.overwrite(
            '/schematics/add-component/files/src/lib/counter/counter.ts',
            PACKAGED_V1.replace('signal(1)', 'signal(2)'),
        );

        tree = await runner.runSchematic('update-components', { names: 'counter' }, tree);

        expect(tree.readContent(target)).toContain('signal(100)');
        const db = JSON.parse(tree.readContent('/.practices-ui/schematics.hashdb.json'));
        expect(db.runs[1].summary.skippedConflict).toBe(1);
    });
});

describe('formatting insensitive hashing', () => {
    it('ignores whitespace, quote style, trailing commas and semicolons', () => {
        expect(isSameContent(PACKAGED_V1, FORMATTED_V1)).toBe(true);
        expect(contentHash(PACKAGED_V1)).toBe(contentHash(FORMATTED_V1));
    });

    it('ignores parentheses Prettier adds around multi-line expressions and the layout of comments', () => {
        const packaged = [
            'export const f = (x: number) => {',
            '  return x > 1 && x < 5; // in range',
            '};',
            '/** Doubles',
            ' * the value */',
        ].join('\n');
        const formatted = [
            'export const f = (x: number) => {',
            '  return (',
            '    x > 1 &&',
            '    x < 5',
            '  ); // in range',
            '};',
            '/**',
            ' * Doubles the value',
            ' */',
            '',
        ].join('\n');

        expect(isSameContent(packaged, formatted)).toBe(true);
    });

    it('ignores HTML comments', () => {
        expect(isSameContent('<p>a</p><!-- note -->', '<p>a</p>')).toBe(true);
    });

    it('detects real changes', () => {
        expect(isSameContent(PACKAGED_V1, PACKAGED_V1.replace('signal(1)', 'signal(2)'))).toBe(false);
        expect(normalizeForCompare('a b')).toBe(normalizeForCompare('ab'));
    });

    it('still accepts plain hashes recorded by earlier versions', () => {
        expect(matchesRecordedHash(PACKAGED_V1, sha256(PACKAGED_V1))).toBe(true);
        expect(matchesRecordedHash(FORMATTED_V1, sha256(PACKAGED_V1))).toBe(false);
    });
});
