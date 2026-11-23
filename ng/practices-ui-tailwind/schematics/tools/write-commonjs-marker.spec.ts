import { describe, expect, it } from '@jest/globals';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { writeCommonJsMarker } = require('./write-commonjs-marker.cjs');

describe('writeCommonJsMarker', () => {
    function createPackage(): { root: string; schematics: string } {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pui-marker-'));
        const schematics = path.join(root, 'schematics');
        fs.mkdirSync(schematics, { recursive: true });
        // Same situation as in the published package: ESM package, CommonJS schematics (tsc output)
        fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'pkg', type: 'module' }));
        fs.writeFileSync(
            path.join(schematics, 'index.js'),
            ['"use strict";', 'Object.defineProperty(exports, "__esModule", { value: true });', 'exports.value = 42;', ''].join(
                '\n'
            )
        );
        // `node -e` exposes a global `exports` and would hide the problem, so load through a script file
        fs.writeFileSync(path.join(root, 'load.cjs'), "console.log(require('./schematics/index.js').value);\n");
        return { root, schematics };
    }

    it('lets Node load CommonJS schematics inside a package that declares "type": "module"', () => {
        const { root, schematics } = createPackage();
        try {
            const load = () =>
                execFileSync(process.execPath, [path.join(root, 'load.cjs')], { cwd: root, stdio: 'pipe' })
                    .toString()
                    .trim();

            // `exports is not defined in ES module scope`
            expect(() => load()).toThrow();

            writeCommonJsMarker(schematics);

            expect(load()).toBe('42');
        } finally {
            fs.rmSync(root, { recursive: true, force: true });
        }
    });

    it('creates the schematics folder if it does not exist and is idempotent', () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pui-marker-'));
        try {
            const dir = path.join(root, 'a', 'b');
            writeCommonJsMarker(dir);
            writeCommonJsMarker(dir);

            expect(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))).toEqual({ type: 'commonjs' });
        } finally {
            fs.rmSync(root, { recursive: true, force: true });
        }
    });
});
