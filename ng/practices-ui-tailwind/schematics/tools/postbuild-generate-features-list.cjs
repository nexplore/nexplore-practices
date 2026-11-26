#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
    const ngRoot = path.resolve(__dirname, '..', '..'); // package root
    const distRoot = path.resolve(ngRoot, '..', 'dist', 'practices-ui-tailwind', 'schematics');
    const manifestPath = path.join(distRoot, 'add-component', 'files', 'component-manifest.json');
    const schemaPath = path.join(distRoot, 'ng-add', 'schema.json');

    if (!fs.existsSync(manifestPath)) {
        console.warn('[postbuild] Manifest not found at', manifestPath, '(skipping features list generation)');
        return;
    }
    if (!fs.existsSync(schemaPath)) {
        console.warn('[postbuild] ng-add schema.json not found at', schemaPath, '(skipping)');
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const components = Object.keys(manifest.components || {}).sort();
    const groups = Object.keys(manifest.groups || {}).sort();

    const items = [];

    // Then individual components
    for (const c of components) {
        items.push(`{ "value": "${c}", "label": "${c}" }`);
    }

    const placeholder = '/* <Generate-Features-List> */';
    let schemaText = fs.readFileSync(schemaPath, 'utf8');
    if (schemaText.indexOf(placeholder) === -1) {
        console.warn('[postbuild] Placeholder not found in schema.json (nothing to replace)');
        return;
    }
    const insertion = items.length ? ',\n' + items.join(',\n') : '';
    schemaText = schemaText.replace(placeholder, insertion);
    // Run prettier
    const prettier = require('prettier');
    schemaText = await prettier.format(schemaText, { parser: 'json' });

    fs.writeFileSync(schemaPath, schemaText, 'utf8');
    console.log('[postbuild] Injected', items.length, 'feature entries into ng-add/schema.json');
}

main().catch((e) => {
    console.error('[postbuild] Failed to generate features list:', e);
    process.exit(1);
});

