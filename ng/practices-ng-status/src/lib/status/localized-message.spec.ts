import { firstValueFrom, Observable, of, skipWhile } from 'rxjs';
import { isLocalizedMessage, isTranslatableMessage } from './localized-message';
import { AggregatedStatusInfo, StatusEvent } from './model';
import { StatusHubService } from './status-hub.service';

describe('isTranslatableMessage', () => {
    it('should accept an object with a key', () => {
        expect(isTranslatableMessage({ key: 'App.Labels_Saving' })).toBe(true);
    });

    it('should ignore internal markers of the status hub', () => {
        expect(isTranslatableMessage({ key: 'App.Labels_Failed', _hasBeenAlreadyPresented: true })).toBe(true);
    });

    it('should accept an object with a key and params', () => {
        expect(isTranslatableMessage({ key: 'App.Labels_Saved', params: { name: 'Foo' } })).toBe(true);
    });

    it.each([
        ['a string', 'Saving...'],
        ['true', true],
        ['null', null],
        ['undefined', undefined],
        ['an error', Object.assign(new Error('Oops'), { key: 'App.Labels_Error' })],
        ['an object with other properties', { key: 'App.Labels_Error', status: 500 }],
        ['an object without a key', { params: { name: 'Foo' } }],
        ['an object with a non-string key', { key: 42 }],
        ['an object with non-object params', { key: 'App.Labels_Error', params: 'foo' }],
        ['an observable', of('Saving...')],
    ])('should reject %s', (_, value) => {
        expect(isTranslatableMessage(value)).toBe(false);
    });
});

describe('isLocalizedMessage', () => {
    it('should accept strings and translatable messages', () => {
        expect(isLocalizedMessage('Saving...')).toBe(true);
        expect(isLocalizedMessage({ key: 'App.Labels_Saving' })).toBe(true);
    });

    it('should reject other values', () => {
        expect(isLocalizedMessage(true)).toBe(false);
        expect(isLocalizedMessage(new Error('Oops'))).toBe(false);
    });
});

describe('StatusHubService with localized messages', () => {
    let statusHub: StatusHubService;

    beforeEach(() => {
        statusHub = new StatusHubService();
    });

    function nextStatus(predicate: (s: AggregatedStatusInfo) => boolean) {
        return firstValueFrom(statusHub.aggregatedStatus$.pipe(skipWhile((s) => !predicate(s))));
    }

    it.each([
        ['a plain string', 'Saving...'],
        ['a translation key', { key: 'App.Labels_Saving', params: { name: 'Foo' } }],
    ])('should pass %s as progress message', async (_, progressMessage) => {
        const status = nextStatus((s) => s.busy);

        statusHub.register(new Observable<StatusEvent>((s) => s.next({ busy: true })), { progressMessage });

        expect((await status).progressMessage).toEqual(progressMessage);
    });

    it('should pass a translation key emitted by an observable as progress message', async () => {
        const progressMessage = { key: 'App.Labels_Saving' };
        const status = nextStatus((s) => !!s.progressMessage);

        statusHub.register(new Observable<StatusEvent>((s) => s.next({ busy: true })), {
            progressMessage: of(progressMessage),
        });

        expect((await status).progressMessage).toEqual(progressMessage);
    });

    it.each([
        ['a plain string', 'Saved!', 'Saved!'],
        ['a translation key', { key: 'App.Labels_Saved' }, { key: 'App.Labels_Saved' }],
        ['a getter returning a translation key', () => ({ key: 'App.Labels_Saved' }), { key: 'App.Labels_Saved' }],
    ])('should use %s as success message', async (_, successMessage, expected) => {
        const status = nextStatus((s) => !!s.success && s.success !== true);

        statusHub.register(of<StatusEvent>({ busy: false, success: true }), { successMessage });

        expect((await status).success).toEqual(expected);
    });

    it.each([
        ['a plain string', 'Failed!', 'Failed!'],
        ['a translation key', { key: 'App.Labels_Failed' }, { key: 'App.Labels_Failed' }],
        ['a getter returning a translation key', () => ({ key: 'App.Labels_Failed' }), { key: 'App.Labels_Failed' }],
    ])('should use %s as error message', async (_, errorMessage, expected) => {
        const status = nextStatus((s) => !!s.error);

        statusHub.register(of<StatusEvent>({ busy: false, error: new Error('Oops') }), { errorMessage });

        const error = (await status).error;
        expect(error).toEqual(typeof expected === 'string' ? expected : expect.objectContaining(expected));
        expect(isLocalizedMessage(error)).toBe(true);
    });

    it('should not attach internal markers to a shared error message object', async () => {
        const errorMessage = { key: 'App.Labels_Failed' };
        const status = nextStatus((s) => !!s.error);

        statusHub.register(of<StatusEvent>({ busy: false, error: new Error('Oops') }), { errorMessage });
        await status;

        expect(errorMessage).toEqual({ key: 'App.Labels_Failed' });
    });

    it('should list a success event with a translation key as latest status event', async () => {
        const events = firstValueFrom(statusHub.latestStatusEvents$.pipe(skipWhile((evs) => evs.length === 0)));

        statusHub.register(of<StatusEvent>({ busy: false, success: true }), {
            successMessage: { key: 'App.Labels_Saved' },
        });

        expect((await events)[0].success).toEqual({ key: 'App.Labels_Saved' });
    });
});
