#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const root = path.resolve(__dirname, '..', '..');
const srcLib = path.join(root, 'src');
// Monorepo ng root (one level above the package root)
const ngRoot = path.join(root, '..');
const distOut = path.join(ngRoot, 'dist', 'practices-ui-tailwind', 'schematics', 'add-component', 'files', 'src');
// Write snapshot directly to package-local dist
const out = distOut;

const dryRun = process.argv.includes('--dry-run');

if (!fs.existsSync(srcLib)) {
    console.error('[copy-snapshot] src/lib not found at', srcLib);
    process.exit(1);
}

const entries = fg.sync(['**/*.{ts,html,scss,css}'], { cwd: srcLib });
if (dryRun) {
    console.log('[copy-snapshot] Dry-run: would copy', entries.length, 'files to', out);
    for (const e of entries.slice(0, 200)) {
        console.log('  ', e);
    }
    if (entries.length > 200) console.log('  ...', entries.length - 200, 'more files');
    process.exit(0);
}

let copied = 0;
for (const e of entries) {
    const src = path.join(srcLib, e);
    const dest = path.join(out, e);
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    copied++;
}
console.log('[copy-snapshot] Copied', copied, 'files into schematics snapshot at', out);

// Also copy collection.json and schematic schema files to dist schematics root so published package can resolve collection.json
const schematicsRootSrc = path.join(root, 'schematics');
const schematicsRootDest = path.join(ngRoot, 'dist', 'practices-ui-tailwind', 'schematics');
try {
    const collectionSrc = path.join(schematicsRootSrc, 'collection.json');
    if (fs.existsSync(collectionSrc)) {
        fs.copyFileSync(collectionSrc, path.join(schematicsRootDest, 'collection.json'));
    }
    // Dynamically discover schematic directories containing a schema.json (exclude tools)
    const schematicDirs = fs
        .readdirSync(schematicsRootSrc, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== 'tools')
        .map((d) => d.name);
    for (const dir of schematicDirs) {
        const schemaSrc = path.join(schematicsRootSrc, dir, 'schema.json');
        if (!fs.existsSync(schemaSrc)) continue;
        const destDir = path.join(schematicsRootDest, dir);
        ensureDir(destDir);
        fs.copyFileSync(schemaSrc, path.join(destDir, 'schema.json'));
    }
    console.log('[copy-snapshot] Ensured collection.json and schemas copied to dist schematics root');
} catch (e) {
    console.error('[copy-snapshot] Failed copying collection/schema files:', e);
    process.exitCode = 1;
}

