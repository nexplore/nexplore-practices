#!/usr/bin/env node
// Visual regression comparison of the practices-ui-ktbe Storybook against any git ref.
//
//   node visual-tests/compare-with-ref.mjs <ref> [--node <version>] [--filter <regex>] [--skip-baseline] [--skip-build]
//
// 1. Checks out <ref> into a separate git worktree (ng/tmp/visual-baseline), installs its dependencies
//    and builds its Storybook (with the Node version from its .nvmrc or --node, via fnm if available).
// 2. Screenshots every story of that build as reference (visual-tests/__screenshots__).
// 3. Builds the Storybook of the current working tree and compares every story against the reference.
//
// The HTML report with side-by-side/diff views ends up in visual-tests/report.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const ngDir = path.resolve(here, '..');
const worktreeDir = path.join(ngDir, 'tmp', 'visual-baseline');
const worktreeNgDir = path.join(worktreeDir, 'ng');
const storybookOutput = path.join('dist', 'storybook', 'practices-ui-ktbe');
const snapshotDir = path.join(here, '__screenshots__');

const { values: options, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        node: { type: 'string' },
        filter: { type: 'string' },
        'skip-baseline': { type: 'boolean', default: false },
        'skip-build': { type: 'boolean', default: false },
    },
});
const ref = positionals[0];
if (!ref && !options['skip-baseline']) {
    console.error(
        'Usage: node visual-tests/compare-with-ref.mjs <git-ref> [--node <version>] [--filter <regex>] [--skip-baseline] [--skip-build]'
    );
    process.exit(2);
}

const hasFnm = spawnSync('fnm', ['--version'], { shell: true, stdio: 'ignore' }).status === 0;

/** Resolves the bin directory of the given Node version via fnm, so it can be put in front of PATH. */
function resolveNodeBinDir(node) {
    const result = spawnSync(`fnm exec --using=${node} -- node -p "require('path').dirname(process.execPath)"`, {
        shell: true,
        encoding: 'utf-8',
    });
    if (result.status !== 0) {
        throw new Error(`Could not resolve Node ${node} via fnm:\n${result.stderr}`);
    }
    return result.stdout.trim();
}

function run(command, { cwd = ngDir, env = {}, nodeBinDir, allowFailure = false } = {}) {
    console.log(
        `\n> ${command}   (in ${path.relative(process.cwd(), cwd) || '.'}${nodeBinDir ? `, Node from ${nodeBinDir}` : ''})`
    );
    const pathKey = Object.keys(process.env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
    const pathEnv = nodeBinDir ? { [pathKey]: `${nodeBinDir}${path.delimiter}${process.env[pathKey]}` } : {};
    const result = spawnSync(command, {
        cwd,
        shell: true,
        stdio: 'inherit',
        env: { ...process.env, NX_DAEMON: 'false', ...pathEnv, ...env },
    });
    if (result.status !== 0 && !allowFailure) {
        console.error(`\nCommand failed with exit code ${result.status}: ${command}`);
        process.exit(result.status ?? 1);
    }
    return result.status ?? 1;
}

function git(args, cwd = ngDir) {
    const result = spawnSync('git', ['-c', 'core.longpaths=true', ...args], { cwd, encoding: 'utf-8' });
    if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} failed:\n${result.stderr}`);
    }
    return result.stdout.trim();
}

function readNvmrc(dir) {
    const file = path.join(dir, '.nvmrc');
    return existsSync(file) ? readFileSync(file, 'utf-8').trim() : undefined;
}

function prepareBaselineStorybook() {
    const sha = git(['rev-parse', '--verify', `${ref}^{commit}`]);
    console.log(`Reference: ${ref} (${sha.slice(0, 10)})`);

    if (existsSync(path.join(worktreeDir, '.git'))) {
        git(['checkout', '--force', '--detach', sha], worktreeDir);
    } else {
        git(['worktree', 'add', '--force', '--detach', worktreeDir, sha]);
    }

    const node = options.node ?? readNvmrc(worktreeNgDir);
    let nodeBinDir;
    if (node && !hasFnm) {
        console.warn(`Warning: ${ref} expects Node ${node}, but fnm is not installed. Using ${process.version}.`);
    } else if (!node) {
        console.warn(`Warning: ${ref} has no .nvmrc and --node was not given. Using ${process.version}.`);
    } else {
        run(`fnm install ${node}`, { allowFailure: true });
        nodeBinDir = resolveNodeBinDir(node);
    }

    // Only reinstall dependencies when the lock file or the Node version changed.
    const lockFile = path.join(worktreeNgDir, 'package-lock.json');
    const installHash = createHash('sha256').update(readFileSync(lockFile)).update(String(node)).digest('hex');
    const markerFile = path.join(worktreeNgDir, 'node_modules', '.visual-baseline-install');
    if (!existsSync(markerFile) || readFileSync(markerFile, 'utf-8') !== installHash) {
        run('npm ci', { cwd: worktreeNgDir, nodeBinDir });
        writeFileSync(markerFile, installHash);
    }

    run('npx nx run practices-ui-ktbe:build-storybook', { cwd: worktreeNgDir, nodeBinDir });
    return path.join(worktreeNgDir, storybookOutput);
}

const playwright = 'npx playwright test -c visual-tests/playwright.config.ts';
const filterEnv = options.filter ? { VISUAL_FILTER: options.filter } : {};

if (!options['skip-baseline']) {
    const baselineStorybook = prepareBaselineStorybook();
    rmSync(snapshotDir, { recursive: true, force: true });
    console.log('\nCreating reference screenshots...');
    const status = run(`${playwright} --update-snapshots=all`, {
        env: { VISUAL_STORYBOOK_DIR: baselineStorybook, ...filterEnv },
        allowFailure: true,
    });
    if (status !== 0) {
        console.warn(
            '\nSome stories could not be captured in the reference build (see output above). They will be reported as missing.'
        );
    }
}

if (!options['skip-build']) {
    run('npx nx run practices-ui-ktbe:build-storybook');
}

console.log('\nComparing current Storybook against the reference screenshots...');
const status = run(playwright, { env: filterEnv, allowFailure: true });
console.log(`\nReport: npx playwright show-report ${path.join('visual-tests', 'report')}`);
process.exit(status);
