import { TestBed } from '@angular/core/testing';
import { command } from '@nexplore/practices-ng-commands';
import { delay, of } from 'rxjs';
import { createSelectViewSourceFromCommand } from './create-select-view-source-from-command';

describe('createSelectViewSourceFromCommand', () => {
    class TestDto {
        constructor(public name: string) {}
    }

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    async function flush() {
        for (let i = 0; i < 5; i++) {
            await jest.advanceTimersByTimeAsync(500);
            TestBed.tick();
        }
    }

    function createDtos(names: string[]) {
        return names.map((name) => new TestDto(name));
    }

    it('should call the handler only once when the command is created withAutoTrigger', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withAutoTrigger(() => {
                    handlerCalls++;
                    return of(createDtos(['A', 'B'])).pipe(delay(50));
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });

    it('should call the handler only once when the command is created withManualTrigger', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withManualTrigger(() => {
                    handlerCalls++;
                    return of(createDtos(['A', 'B'])).pipe(delay(50));
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });

    it('should show the result of an external trigger without calling the handler again', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withManualTrigger((names: unknown) => {
                handlerCalls++;
                return of(createDtos(Array.isArray(names) ? names : ['A'])).pipe(delay(50));
            })
        );
        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        cmd.trigger(['X', 'Y']);
        await flush();

        expect(handlerCalls).toBe(2);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['X', 'Y']);
    });

    it('should trigger the command with the filter when the filter changes', async () => {
        const args: unknown[] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withManualTrigger((filter: unknown) => {
                    args.push(filter);
                    return of(createDtos(['A'])).pipe(delay(50));
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe();
        await flush();

        vs.filter({ name: 'A' });
        await flush();

        expect(args).toEqual([{}, { name: 'A' }]);
    });

    it('should trigger the command with the new filter when the filter changes right after an external trigger', async () => {
        const args: unknown[] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withManualTrigger((filter: unknown) => {
                args.push(filter);
                return createDtos(['A']);
            })
        );
        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

        vs.pageData$.subscribe();
        await flush();

        cmd.trigger({ name: 'external' });
        vs.filter({ name: 'A' });
        await flush();

        expect(args).toEqual([{}, { name: 'external' }, { name: 'A' }]);
    });

    it('should trigger the command with the new filter when an external trigger follows right after a filter change', async () => {
        const args: unknown[] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withManualTrigger((filter: unknown) => {
                args.push(filter);
                return createDtos(['A']);
            })
        );
        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

        vs.pageData$.subscribe();
        await flush();

        vs.filter({ name: 'A' });
        cmd.trigger({ name: 'external' });
        await flush();

        expect(args).toEqual([{}, { name: 'external' }, { name: 'A' }]);
    });

    it('should call the handler only once when an auto triggered command responds slower than the debounce', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withAutoTrigger(() => {
                    handlerCalls++;
                    return of(createDtos(['A', 'B'])).pipe(delay(1000));
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });
});
