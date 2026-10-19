import { appendFileSync } from 'fs';

export type ParityRecord = {
    id: string;
    title: string;
    reactive: unknown;
    signal: unknown;
    parity: 'yes' | 'differs-intentionally';
    note?: string;
};

/** Appends a record to the report file given by `PARITY_REPORT` (one JSON object per line); no-op if unset. */
export function recordParity(record: ParityRecord): void {
    const file = process.env['PARITY_REPORT'];
    if (file) {
        appendFileSync(file, JSON.stringify(record) + '\n');
    }
}
