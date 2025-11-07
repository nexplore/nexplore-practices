import { Tree } from '@angular-devkit/schematics';
import * as crypto from 'crypto';

export interface HashDbFileEntry {
    hash: string;
    component: string;
    sourceVersion?: string;
    lastUpdatedByRunId: string;
}
export interface HashDb {
    schemaVersion: string;
    manifestVersion?: string;
    libVersion?: string;
    dest?: string;
    globalStylesEntry?: string; // cached absolute path like '/src/styles.css'
    runs: Array<{ runId: string; timestamp: string; action: 'add' | 'update'; selection: any; summary: any }>;
    files: Record<string, HashDbFileEntry>;
}

const DB_PATH = '.practices-ui/schematics.hashdb.json';
const SCHEMA_VERSION = '1.0.0';

export function readHashDb(tree: Tree): HashDb {
    const buf = tree.read(DB_PATH);
    if (!buf) {
        return { schemaVersion: SCHEMA_VERSION, runs: [], files: {} };
    }
    try {
        return JSON.parse(buf.toString('utf8')) as HashDb;
    } catch (e) {
        throw new Error('Failed to parse hash db: ' + e);
    }
}

export function writeHashDb(tree: Tree, db: HashDb) {
    const content = JSON.stringify(db, null, 2);
    if (tree.exists(DB_PATH)) tree.overwrite(DB_PATH, content);
    else tree.create(DB_PATH, content);
}

export function sha256(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}
