import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { command } from '@nexplore/practices-ng-commands';
import { BehaviorSubject, concat, delay, NEVER, of, switchMap, throwError, timer } from 'rxjs';
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

    it('should call the handler only once when an auto triggered command responds synchronously', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withAutoTrigger(() => {
                    handlerCalls++;
                    return of(createDtos(['A', 'B']));
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });

    it('should call the handler only once when a slow auto triggered command cancels running triggers', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withAutoTrigger(
                    () => {
                        handlerCalls++;
                        return of(createDtos(['A', 'B'])).pipe(delay(1000));
                    },
                    { concurrentTriggerBehavior: { type: 'cancelRunning' } }
                ),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });

    it('should show the existing result of a command without calling the handler again', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withAutoTrigger(() => {
                handlerCalls++;
                return of(createDtos(['A', 'B'])).pipe(delay(50));
            })
        );
        await flush();

        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));
        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
    });

    it('should trigger the new command with the filter when the command changes while a load waits for the previous one', async () => {
        const args1: unknown[] = [];
        const args2: unknown[] = [];
        const results: TestDto[][] = [];

        const createCommand = (args: unknown[], prefix: string) =>
            TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger((filter: any) => {
                    args.push(filter);
                    return of(createDtos([`${prefix}-${filter?.name ?? 'all'}`])).pipe(delay(1000));
                })
            );
        const commandSignal = signal(createCommand(args1, 'cmd1'));
        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(commandSignal, { label: 'name' })
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        vs.filter({ name: 'A' });
        await jest.advanceTimersByTimeAsync(400);
        vs.filter({ name: 'B' });
        await jest.advanceTimersByTimeAsync(400);
        commandSignal.set(createCommand(args2, 'cmd2'));
        await flush();

        expect(args1).toEqual([{}, { name: 'A' }]);
        expect(args2).toEqual([{ name: 'B' }]);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['cmd2-B']);
    });

    it('should show the results of the command without triggering it when triggerQueryCommandWithFilter is false', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withAutoTrigger(() => {
                handlerCalls++;
                return of(createDtos([`run ${handlerCalls}`])).pipe(delay(50));
            })
        );
        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(cmd, { label: 'name', triggerQueryCommandWithFilter: false })
        );

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['run 1']);

        cmd.trigger();
        await flush();

        expect(handlerCalls).toBe(2);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['run 2']);
    });

    describe('withMutableResult', () => {
        function createMutableCommand(args: unknown[]) {
            return TestBed.runInInjectionContext(() =>
                command.query
                    .withManualTrigger((filter: any) => {
                        args.push(filter);
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    })
                    .withMutableResult()
            );
        }

        it('should trigger the command once on the initial load', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createMutableCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            expect(args).toEqual([{}]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['all']);
        });

        it('should show a mutated result without triggering the command while the initial filter is active', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createMutableCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            cmd.resultSignal.set(createDtos(['mutated']));
            await flush();

            expect(args).toEqual([{}]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['mutated']);
        });

        it('should show the original result again when a mutation is undone', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createMutableCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            const original = cmd.result;
            cmd.resultSignal.set(createDtos(['mutated']));
            await flush();
            cmd.resultSignal.set(original);
            await flush();

            expect(args).toEqual([{}]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['all']);
        });

        it('should call the handler only once when a slow auto triggered command has a mutable result', async () => {
            let handlerCalls = 0;
            const results: TestDto[][] = [];

            const vs = TestBed.runInInjectionContext(() =>
                createSelectViewSourceFromCommand(
                    command.query
                        .withAutoTrigger(() => {
                            handlerCalls++;
                            return of(createDtos(['A', 'B'])).pipe(delay(1000));
                        })
                        .withMutableResult(),
                    { label: 'name' }
                )
            );

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            expect(handlerCalls).toBe(1);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A', 'B']);
        });

        it('should trigger the command with the active filter only once, and again when the result is mutated', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createMutableCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();
            vs.filter({ name: 'A' });
            await flush();

            expect(args).toEqual([{}, { name: 'A' }]);

            cmd.resultSignal.set(createDtos(['mutated']));
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: 'A' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        });

        it('should trigger the command with the initial filter when reset while a filter is still loading', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createMutableCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.reset();
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, {}]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['all']);
        });
    });

    it('should show every external result, even when it is the same array changed in place', async () => {
        const args: unknown[] = [];
        const results: string[][] = [];
        const cached = createDtos(['X']);

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withManualTrigger((filter: any) => {
                args.push(filter);
                return of(filter === 'cached' ? cached : createDtos(['all'])).pipe(delay(50));
            })
        );
        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

        vs.pageData$.subscribe((data) => results.push(data.map((d) => d.name)));
        await flush();

        cmd.trigger('cached' as any);
        await flush();
        cached.splice(0, 1, new TestDto('Y'));
        cmd.trigger('cached' as any);
        await flush();

        expect(args).toEqual([{}, 'cached', 'cached']);
        expect(results.at(-1)).toEqual(['Y']);
    });

    it('should show the result of an external trigger without calling the handler again when the filter was cleared', async () => {
        const args: unknown[] = [];
        const results: TestDto[][] = [];

        const cmd = TestBed.runInInjectionContext(() =>
            command.query.withManualTrigger((filter: any) => {
                args.push(filter);
                return of(createDtos(Array.isArray(filter) ? filter : [filter?.name || 'all'])).pipe(delay(50));
            })
        );
        const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

        vs.pageData$.subscribe((data) => results.push(data));
        await flush();
        vs.filter({ name: 'A' });
        await flush();
        vs.filter({ name: '' });
        await flush();

        cmd.trigger(['X'] as any);
        await flush();

        expect(args).toEqual([{}, { name: 'A' }, { name: '' }, ['X']]);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['X']);
    });

    it.each([50, 1000])(
        'should show the results of an auto triggered command that never completes (first result after %i ms)',
        async (firstResultDelay) => {
            let handlerCalls = 0;
            const results: TestDto[][] = [];

            const vs = TestBed.runInInjectionContext(() =>
                createSelectViewSourceFromCommand(
                    command.query.withAutoTrigger(() => {
                        handlerCalls++;
                        return concat(of(createDtos(['A'])).pipe(delay(firstResultDelay)), NEVER);
                    }),
                    { label: 'name' }
                )
            );

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            expect(handlerCalls).toBe(1);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        }
    );

    it('should show the latest results of a command that never completes while a filter is applied', async () => {
        let handlerCalls = 0;
        const results: TestDto[][] = [];
        const busy: boolean[] = [];
        const store = new BehaviorSubject(createDtos(['A']));

        const vs = TestBed.runInInjectionContext(() =>
            createSelectViewSourceFromCommand(
                command.query.withAutoTrigger(() => {
                    handlerCalls++;
                    return store.asObservable();
                }),
                { label: 'name' }
            )
        );

        vs.pageData$.subscribe((data) => results.push(data));
        vs.busy$.subscribe((b) => busy.push(b));
        await flush();

        vs.filter({ name: 'x' });
        await flush();

        expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        expect(busy.at(-1)).toBe(false);

        store.next(createDtos(['B']));
        await flush();

        expect(handlerCalls).toBe(1);
        expect(results.at(-1)?.map((d) => d.name)).toEqual(['B']);
        expect(busy.at(-1)).toBe(false);
    });

    describe('with a slow handler', () => {
        function createSlowCommand(args: unknown[]) {
            return TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger((filter: any) => {
                    args.push(filter);
                    if (filter === 'fail') {
                        return timer(1000).pipe(switchMap(() => throwError(() => new Error('fail'))));
                    }
                    return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                })
            );
        }

        it('should trigger the command with the new filter when the filter changes while the previous filter is still loading', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createSlowCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.filter({ name: 'B' });
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: 'B' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['B']);
        });

        it('should trigger the command with the new filter only once when a waitForRunning command is still loading', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger(
                    (filter: any) => {
                        args.push(filter);
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    },
                    { waitForRunning: true }
                )
            );
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.filter({ name: 'B' });
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: 'B' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['B']);
        });

        it('should let an external trigger queued by a waitForRunning command run first', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger(
                    (filter: any) => {
                        args.push(filter);
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    },
                    { waitForRunning: true }
                )
            );
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.filter({ name: 'B' });
            await jest.advanceTimersByTimeAsync(400);
            cmd.trigger({ name: 'external' });
            await flush();
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: 'external' }, { name: 'B' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['B']);
        });

        it('should show an external result that arrives while the load triggered after waiting is still running', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger(
                    (filter: any) => {
                        args.push(filter);
                        if (filter === 'external') {
                            return of(createDtos(['external']));
                        }
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    },
                    { waitForRunning: true }
                )
            );
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.filter({ name: '' });
            await jest.advanceTimersByTimeAsync(1200);
            cmd.trigger('external' as any);
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: '' }, 'external']);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['external']);
        });

        it('should cancel the running filter and trigger the command with the new filter when the command cancels running triggers', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = TestBed.runInInjectionContext(() =>
                command.query.withManualTrigger(
                    (filter: any) => {
                        args.push(filter);
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    },
                    { concurrentTriggerBehavior: { type: 'cancelRunning' } }
                )
            );
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.filter({ name: 'B' });
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, { name: 'B' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['B']);
        });

        it('should trigger the command with the initial filter when reset while a filter is still loading', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createSlowCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            vs.reset();
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, {}]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['all']);
        });

        it('should trigger the command with the active filter when an external trigger completes', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createSlowCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();
            vs.filter({ name: 'A' });
            await flush();

            cmd.trigger();
            await flush();

            expect(args).toEqual([{}, { name: 'A' }, undefined, { name: 'A' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        });

        it('should trigger the command with the new filter when an external trigger fails while the filter changes', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createSlowCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            cmd.triggerAsync('fail' as any).catch(() => undefined);
            vs.filter({ name: 'A' });
            await flush();

            expect(args).toEqual([{}, 'fail', { name: 'A' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        });

        it('should trigger the command with the new filter when an external trigger is cancelled while the filter changes', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];
            const cmd = createSlowCommand(args);
            const vs = TestBed.runInInjectionContext(() => createSelectViewSourceFromCommand(cmd, { label: 'name' }));

            vs.pageData$.subscribe((data) => results.push(data));
            await flush();

            cmd.trigger({ name: 'external' });
            vs.filter({ name: 'A' });
            await jest.advanceTimersByTimeAsync(400);
            cmd.cancel();
            await flush();

            expect(args).toEqual([{}, { name: 'external' }, { name: 'A' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        });

        it('should trigger the command with the filter when the filter changes while an auto triggered command is still loading', async () => {
            const args: unknown[] = [];
            const results: TestDto[][] = [];

            const vs = TestBed.runInInjectionContext(() =>
                createSelectViewSourceFromCommand(
                    command.query.withAutoTrigger((filter: any) => {
                        args.push(filter);
                        return of(createDtos([filter?.name ?? 'all'])).pipe(delay(1000));
                    }),
                    { label: 'name' }
                )
            );

            vs.pageData$.subscribe((data) => results.push(data));
            TestBed.tick();
            vs.filter({ name: 'A' });
            await flush();

            expect(args).toEqual([undefined, { name: 'A' }]);
            expect(results.at(-1)?.map((d) => d.name)).toEqual(['A']);
        });
    });
});
