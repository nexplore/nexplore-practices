import { lastValueFrom, of } from 'rxjs';
import { StatusHubConfig } from './model';
import { getLatestStatusEventsList$, StatusMap } from './status-hub.util-internal';

describe('getLatestStatusEventsList', () => {
    const config: StatusHubConfig = {
        maxVisibleEventCount: 3,
        messageEventTimeToLiveMs: 3000,
    };

    it('Should ignore double errors', async () => {
        const error = new Error('Test error');
        const now = performance.now();
        const eventMap: StatusMap = {
            ['0']: {
                error,
                timestamp: now - 10,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
            ['1']: {
                error,
                timestamp: now,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
        };

        const result = await lastValueFrom(getLatestStatusEventsList$(of(eventMap), config));

        expect(result).toEqual([eventMap['1']]);
    });

    it('Should ignore double errors with same message only', async () => {
        const now = performance.now();
        const eventMap: StatusMap = {
            ['0']: {
                error: new Error('Test error'),
                timestamp: now - 10,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
            ['1']: {
                error: new Error('Test error'),
                timestamp: now,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
        };

        const result = await lastValueFrom(getLatestStatusEventsList$(of(eventMap), config));

        expect(result).toEqual([eventMap['1']]);
    });

    it('Should not ignore different errors', async () => {
        const now = performance.now();
        const eventMap: StatusMap = {
            ['0']: {
                error: new Error('Test error 1'),
                timestamp: now - 10,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
            ['1']: {
                error: new Error('Test error 2'),
                timestamp: now,
                busy: false,
                dismiss: () => {},
                autohide: false,
            },
        };

        const result = await lastValueFrom(getLatestStatusEventsList$(of(eventMap), config));

        expect(result).toEqual([eventMap['1'], eventMap['0']]);
    });
});
