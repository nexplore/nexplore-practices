import { Tree } from '@angular-devkit/schematics';
import { readHashDb, writeHashDb } from './hash-db';

// Compute first styles entry from angular.json and return as absolute POSIX path (e.g., '/src/styles.css')
function computeFirstStylesEntry(tree: Tree): string | undefined {
  const angularJsonPath = '/angular.json';
  if (!tree.exists(angularJsonPath)) return undefined;
  const buf = tree.read(angularJsonPath);
  if (!buf) return undefined;
  try {
    const angularConfig = JSON.parse(buf.toString('utf8')) as { projects?: Record<string, unknown> };
    const projects = angularConfig.projects || {};
    for (const name of Object.keys(projects)) {
      const projVal = projects[name];
      if (typeof projVal !== 'object' || projVal === null) continue;
      const projObj = projVal as Record<string, unknown>;
      const architect = projObj['architect'] as Record<string, unknown> | undefined;
      const targets = (projObj['targets'] as Record<string, unknown> | undefined) || undefined;
      const build = (architect?.['build'] || targets?.['build']) as { options?: unknown } | undefined;
      const opts = build?.options as { styles?: unknown[] } | undefined;
      if (opts && Array.isArray(opts.styles)) {
        const entry = opts.styles.find((s: unknown) => typeof s === 'string');
        if (entry) {
          const p = (entry as string).replace(/\\/g, '/');
          return p.startsWith('/') ? p : '/' + p;
        }
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

// Return cached first styles entry if available; otherwise compute and cache it in the hash DB.
export function findAndCacheGlobalStylesEntry(tree: Tree): string | undefined {
  const db = readHashDb(tree);
  if (db.globalStylesEntry) return db.globalStylesEntry;
  const computed = computeFirstStylesEntry(tree);
  if (computed) {
    db.globalStylesEntry = computed;
    writeHashDb(tree, db);
  }
  return computed;
}

// Return cached value only (no computation or persistence). Useful for consumers that want to avoid IO unless needed.
export function getCachedGlobalStylesEntry(tree: Tree): string | undefined {
  const db = readHashDb(tree);
  return db.globalStylesEntry;
}

