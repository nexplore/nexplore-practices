#!/usr/bin/env node
/*
  Adds `import { describe, expect, it } from '@jest/globals';` to all failing
  test files that likely miss Jest globals. Heuristic:
  - Targets .spec.ts files
  - Skips files that already reference '@jest/globals'
  - Only modifies files that reference describe/it/expect to avoid noise
  - Skips common ignore directories
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..'); // ng/

const BASE_IMPORTS = ['describe', 'expect', 'it'];
const SPEC_SUFFIX = '.spec.ts';
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'tmp',
  'temp',
  '.next',
  'build'
]);

/**
 * Recursively walk a directory and gather .spec.ts files.
 */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      // Skip hidden directories like .git, .vscode
      if (entry.name.startsWith('.')) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      if (entry.name.endsWith(SPEC_SUFFIX)) {
        yield full;
      }
    }
  }
}

function collectNeededImports(content) {
  const names = new Set();
  // Always include base if used
  if (/\bdescribe\s*\(/.test(content)) names.add('describe');
  if (/\bit\s*\(/.test(content)) names.add('it');
  if (/\btest\s*\(/.test(content)) names.add('test');
  if (/\bexpect\s*\(/.test(content)) names.add('expect');
  // Lifecycle + jest
  if (/\bbeforeEach\s*\(/.test(content)) names.add('beforeEach');
  if (/\bafterEach\s*\(/.test(content)) names.add('afterEach');
  if (/\bbeforeAll\s*\(/.test(content)) names.add('beforeAll');
  if (/\bafterAll\s*\(/.test(content)) names.add('afterAll');
  if (/\bjest\b/.test(content)) names.add('jest');
  return names;
}

function ensureJestGlobalsImport(content) {
  const needed = collectNeededImports(content);
  if (needed.size === 0) return content; // nothing to do

  const lines = content.split(/\r?\n/);
  const importRegex = /^\s*import\s*\{([^}]*)\}\s*from\s*['"]@jest\/globals['"];?\s*$/;
  let foundIndex = -1;
  let currentNames = new Set();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(importRegex);
    if (m) {
      foundIndex = i;
      const inside = m[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      inside.forEach((n) => currentNames.add(n));
      break;
    }
  }

  // Merge
  const merged = new Set([...currentNames, ...needed]);
  const importLine = `import { ${[...merged].sort().join(', ')} } from '@jest/globals';`;

  if (foundIndex >= 0) {
    // Replace existing line
    if (lines[foundIndex] !== importLine) {
      lines[foundIndex] = importLine;
      return lines.join('\n');
    }
    return content; // already good
  }

  // Insert new import near the top (after leading comments/blank lines)
  let insertIndex = 0;
  while (insertIndex < lines.length) {
    const line = lines[insertIndex];
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      insertIndex++;
      continue;
    }
    break;
  }
  lines.splice(insertIndex, 0, importLine);
  return lines.join('\n');
}

function main() {
  const base = ROOT; // ng/
  const changed = [];
  for (const file of walk(base)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const updated = ensureJestGlobalsImport(content);
      if (updated !== content) {
        fs.writeFileSync(file, updated, 'utf8');
        changed.push(path.relative(base, file));
      }
    } catch (e) {
      console.error(`Failed to process ${file}:`, e.message);
    }
  }

  if (changed.length === 0) {
    console.log('No files needed the Jest globals import.');
  } else {
    console.log('Added Jest globals import to:');
    for (const f of changed) console.log(' - ' + f);
  }
}

main();
