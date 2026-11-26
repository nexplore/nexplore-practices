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

/**
 * Normalizes source text so that two files compare equal when they only differ in formatting.
 *
 * The Angular CLI formats every file a schematic creates with the Prettier of the workspace: whitespace, quotes,
 * trailing commas, semicolons, parentheses around multi-line expressions and the layout of comments change. A plain
 * hash of the packaged content would therefore never match the file on disk. The normalized text is only used to
 * detect local modifications, it is never written anywhere.
 *
 * Trade-off: parentheses and comments are ignored, a change that consists only of those is not detected.
 */
export function normalizeForCompare(content: string): string {
    return content
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"])\/\/[^\n]*/gm, '$1')
        .replace(/\s+/g, '')
        .replace(/"/g, "'")
        .replace(/,(?=[)\]}>])/g, '')
        .replace(/[();]/g, '');
}

/** Formatting insensitive hash used to detect local modifications. */
export function contentHash(content: string | Buffer): string {
    return sha256(normalizeForCompare(content.toString()));
}

export function isSameContent(a: string, b: string): boolean {
    return normalizeForCompare(a) === normalizeForCompare(b);
}

/**
 * True if `current` is what was recorded in the hash db (also for entries recorded as plain hash by earlier versions).
 */
export function matchesRecordedHash(current: string, recordedHash: string): boolean {
    return contentHash(current) === recordedHash || sha256(current) === recordedHash;
}

