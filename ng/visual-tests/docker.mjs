#!/usr/bin/env node
// Runs the visual regression tests in the official Playwright Docker image, so the screenshots are identical on every
// machine and on the build server (font rendering depends on the operating system).
//
//   node visual-tests/docker.mjs [playwright test arguments, e.g. --update-snapshots=all]
//
// The ng workspace is mounted into the container. Builds (Storybook, samples-ktbe) are created on the host before.
// Paths in VISUAL_STORYBOOK_DIR / VISUAL_SAMPLES_DIR / VISUAL_SNAPSHOT_DIR must be inside the ng workspace.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ngDir = path.resolve(here, '..');
const mountDir = '/work';

function playwrightVersion() {
    const installed = path.join(ngDir, 'node_modules', '@playwright', 'test', 'package.json');
    if (existsSync(installed)) {
        return JSON.parse(readFileSync(installed, 'utf-8')).version;
    }
    return process.env['VISUAL_PLAYWRIGHT_VERSION'] ?? '1.65.0';
}

/** Maps a host path inside the ng workspace to the path inside the container. */
function toContainerPath(hostPath) {
    const relative = path.relative(ngDir, path.resolve(hostPath));
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`${hostPath} is not inside the ng workspace (${ngDir}) and cannot be used in the container.`);
    }
    return path.posix.join(mountDir, ...relative.split(path.sep));
}

const version = playwrightVersion();
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const envArgs = [];
for (const name of ['VISUAL_STORYBOOK_DIR', 'VISUAL_SAMPLES_DIR', 'VISUAL_SNAPSHOT_DIR']) {
    if (process.env[name]) {
        envArgs.push('-e', `${name}=${toContainerPath(process.env[name])}`);
    }
}
for (const name of ['VISUAL_FILTER', 'VISUAL_STORYBOOK_PORT', 'VISUAL_SAMPLES_PORT', 'CI']) {
    if (process.env[name]) {
        envArgs.push('-e', `${name}=${process.env[name]}`);
    }
}

// Uses @playwright/test of the workspace. Checkouts without it (e.g. older releases) get it installed in a directory of
// the container only, so the node_modules of the host are never touched by npm running on Linux.
const quoted = process.argv
    .slice(2)
    .map((arg) => `'${arg.replace(/'/g, `'\\''`)}'`)
    .join(' ');
const script = [
    'if [ -f node_modules/@playwright/test/cli.js ]; then PW=node_modules/@playwright/test/cli.js; else',
    `mkdir -p /tmp/pw && (cd /tmp/pw && npm init -y > /dev/null && npm install --ignore-scripts @playwright/test@${version} > /dev/null)`,
    '&& export NODE_PATH=/tmp/pw/node_modules && PW=/tmp/pw/node_modules/@playwright/test/cli.js; fi',
    `&& node "$PW" test -c visual-tests/playwright.config.ts ${quoted}`,
].join(' ');

// On Linux and macOS, run as the current user, so the written screenshots and reports are not owned by root. (Docker
// Desktop on Windows maps the file ownership itself.)
const userArgs =
    typeof process.getuid === 'function' && typeof process.getgid === 'function'
        ? ['--user', `${process.getuid()}:${process.getgid()}`, '-e', 'HOME=/tmp']
        : [];

console.log(`> docker run ${image} playwright test ${process.argv.slice(2).join(' ')}`);
const result = spawnSync(
    'docker',
    [
        'run',
        '--rm',
        '--ipc=host',
        '-v',
        `${ngDir}:${mountDir}`,
        '-w',
        mountDir,
        ...userArgs,
        ...envArgs,
        image,
        'bash',
        '-c',
        script,
    ],
    { stdio: 'inherit' }
);
process.exit(result.status ?? 1);
