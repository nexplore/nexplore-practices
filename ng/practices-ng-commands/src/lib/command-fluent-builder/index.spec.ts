/* eslint-disable */
import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it, jest } from '@jest/globals';
import { distinctUntilChanged, firstValueFrom, Observable, Subject, take, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractCommand } from '../commands/abstract-command';
import { CommandInput, CommandOptions, CommandTriggerOptions } from '../commands/command.types';
import * as command from './index';

function expectToBeCalledBefore(fn0: jest.Mock, fn1: jest.Mock) {
    expect(fn0).toHaveBeenCalled();
    expect(fn1).toHaveBeenCalled();
    const calls0 = fn0.mock.invocationCallOrder;
    const calls1 = fn1.mock.invocationCallOrder;
    expect(calls0).toBeDefined();
    expect(calls1).toBeDefined();
    expect(calls0[0]).toBeLessThan(calls1[0]);
}

describe('command', () => {
    describe('action', () => {
        it('should trigger the command', () => {
            const handler = jest.fn<() => void>();
            TestBed.runInInjectionContext(() => {
                const cmd = command.action(handler);
                cmd.trigger();
            });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should trigger the command with arguments', () => {
            const result: any[] = [];
            const expectedArgs = [1, 2, 3];
            TestBed.runInInjectionContext(() => {
                const cmd = command.action((arg: number[]) => result.push(arg));

                cmd.trigger(expectedArgs);
            });

            expect(result).toEqual([expectedArgs]);
        });

        it('should not trigger while running', () => {
            TestBed.runInInjectionContext(() => {
                const subject = new Subject<void>();
                const handler = jest.fn(() => subject);
                const cmd = command.action(handler);
                cmd.trigger();
                cmd.trigger();
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('background', () => {
        it('should trigger the command on creation', () => {
            TestBed.runInInjectionContext(() => {
                const handler = jest.fn<() => void>();
                const _cmd = command.background(handler);
                expect(handler).toHaveBeenCalled();
            });
        });

        it('should not trigger while running, but trigger after finished', () => {
            TestBed.runInInjectionContext(() => {
                const subject = new Subject<void>();
                const handler = jest.fn(() => subject);
                const cmd = command.action(handler);
                cmd.trigger();
                cmd.trigger();
                subject.complete();
                cmd.trigger();
                expect(handler).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('actionSaveForm', () => {
        it('should accept form group', () => {
            const handler = jest.fn();
            TestBed.runInInjectionContext(() => {
                const form = new FormGroup({ name: new FormControl('hallo') });
                const cmd = command.actionSaveForm(form, handler);
                cmd.trigger();
            });
            expect(handler).toHaveBeenCalled();
        });
    });

    describe('query', () => {
        describe('withAutoTrigger', () => {
            it('should trigger the command on creation', () => {
                TestBed.runInInjectionContext(() => {
                    const handler = jest.fn<() => void>();
                    const _cmd = command.query.withAutoTrigger(handler);
                    TestBed.tick();
                    expect(handler).toHaveBeenCalled();
                });
            });

            it('should set result value for sync method', () => {
                TestBed.runInInjectionContext(() => {
                    const handler = () => 1;
                    const cmd = command.query.withAutoTrigger(handler);
                    TestBed.tick();
                    expect(cmd.result).toBeDefined();
                });
            });

            it('should set result value for async method', () => {
                const results: any[] = [];
                TestBed.runInInjectionContext(() => {
                    const subject = new Subject<number>();
                    const handler = () => subject;
                    const cmd = command.query.withAutoTrigger(handler);
                    TestBed.tick();
                    results.push(cmd.result);
                    subject.next(1);

                    results.push(cmd.result);
                });
                expect(results).toEqual([undefined, 1]);
            });

            it('should not trigger while running', () => {
                TestBed.runInInjectionContext(() => {
                    const subject = new Subject<void>();
                    const handler = jest.fn(() => subject);
                    const cmd = command.query.withAutoTrigger(handler);
                    TestBed.tick();
                    cmd.trigger();
                    cmd.trigger();
                    subject.complete();
                    expect(handler).toHaveBeenCalledTimes(1);
                });
            });
        });

        describe('withSignalTrigger', () => {
            it('should trigger the command on signal change', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = signal(0);

                    const cmd = command.query.withSignalTrigger(source, handler);

                    source.set(1);
                    TestBed.tick();

                    source.set(2);
                    TestBed.tick();
                });
                expect(handler).toHaveBeenCalledTimes(2);
            });

            it('should trigger and cancel when the signal value changes', () => {
                const result: any[] = [];
                TestBed.runInInjectionContext(() => {
                    const completionSubject = new Subject<void>();
                    const source = signal(0);

                    const cmd = command.query.withSignalTrigger(source, (args: number, abortSignal: AbortSignal) => {
                        abortSignal.addEventListener('abort', () => {
                            result.push(`aborted ${args}`);
                        });

                        return completionSubject.pipe(
                            take(1),
                            map(() => `completed ${args}`),
                        );
                    });

                    effect(() => {
                        const res = cmd.resultSignal();
                        if (res) {
                            result.push(res);
                        }
                    });

                    source.set(1);
                    TestBed.tick();

                    source.set(2);
                    TestBed.tick();

                    source.set(3);
                    TestBed.tick();

                    completionSubject.next();
                    TestBed.tick();
                });
                expect(result).toEqual(['aborted 1', 'aborted 2', 'completed 3']);
            });

            it('should not trigger if the signal is undefined', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = signal(undefined);

                    const cmd = command.query.withSignalTrigger(source, handler);

                    TestBed.tick();
                });
                expect(handler).toHaveBeenCalledTimes(0);
            });

            it('should not trigger if the signal is null', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = signal(null);

                    const cmd = command.query.withSignalTrigger(source, handler);

                    TestBed.tick();
                });
                expect(handler).toHaveBeenCalledTimes(0);
            });

            it('should trigger if the signal is 0', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = signal(0);

                    const cmd = command.query.withSignalTrigger(source, handler);

                    TestBed.tick();
                });
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should trigger the command on creation if signal is already set', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = signal(1);

                    const cmd = command.query.withSignalTrigger(source, handler);
                    TestBed.tick();
                });
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe('withCommandSourceDependency', () => {
            it('should trigger the command when source command got result', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = command.action(() => 1);
                    const cmd = command.query.withCommandSourceDependency(source, handler);

                    source.trigger();
                });
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should sync with busy state of source command', async () => {
                const result: any[] = [];
                await TestBed.runInInjectionContext(async () => {
                    const sourceSubject = new Subject<void>();
                    const source = command.action(() => sourceSubject.pipe(take(1)));
                    const targetSubject = new Subject<void>();
                    const cmd = command.query.withCommandSourceDependency(source, () => targetSubject.pipe(take(1)));
                    cmd.busy$.pipe(distinctUntilChanged()).subscribe((busy) => {
                        result.push(busy);
                    });

                    source.trigger();

                    sourceSubject.next();
                    targetSubject.next();
                    await firstValueFrom(timer(1));

                    cmd.trigger();

                    targetSubject.next();
                    await firstValueFrom(timer(1));
                });
                expect(result).toEqual([false, true, false, true, false]);
            });
        });

        describe('withCommandInterdependency', () => {
            it('should trigger the command when source command got result', () => {
                const handler = jest.fn();
                TestBed.runInInjectionContext(() => {
                    const source = command.action(() => 1);
                    const cmd = command.query.withCommandInterdependency(source, handler);

                    source.trigger();
                });
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it('should sync with busy state of source command', async () => {
                const result: any[] = [];
                await TestBed.runInInjectionContext(async () => {
                    const sourceSubject = new Subject<any>();
                    const source = command.action(() => sourceSubject.pipe(take(1)));
                    const targetSubject = new Subject<any>();
                    const targetObs = targetSubject.pipe(take(1));
                    Object.assign(targetObs, { ITSME: 'YES' });
                    const target = command.query.withCommandInterdependency(source, () => targetObs);

                    target.busy$.pipe(distinctUntilChanged()).subscribe((busy) => {
                        result.push(busy);
                    });

                    source.trigger();

                    sourceSubject.next(1);
                    targetSubject.next(2);

                    await firstValueFrom(timer(1));
                    target.trigger();

                    await firstValueFrom(timer(1));
                    sourceSubject.next(3);
                    await firstValueFrom(timer(1));
                    targetSubject.next(4);
                    await firstValueFrom(timer(1));
                });
                expect(result).toEqual([false, true, false, true, false]);
            });

            it('should trigger the source command when the target command is triggered without result and synchronously', async () => {
                const result = [];
                await TestBed.runInInjectionContext(async () => {
                    const source = command.action(() => {
                        result.push('source');
                    });
                    const cmd = command.query.withCommandInterdependency(source, () => {
                        result.push('target');
                    });

                    await cmd.triggerAsync();
                });
                expect(result).toEqual(['source', 'target']);
            });

            it('should trigger the source command when the target command is triggered without result and async', async () => {
                jest.useFakeTimers();
                const result = [];
                await TestBed.runInInjectionContext(async () => {
                    const source = command.action(() => {
                        return timer(100).pipe(map(() => result.push('source')));
                    });
                    const cmd = command.query.withCommandInterdependency(source, () => {
                        return timer(100).pipe(map(() => result.push('target')));
                    });

                    cmd.trigger();
                    await jest.runAllTimersAsync();
                });
                expect(result).toEqual(['source', 'target']);
            });
        });
    });

    describe('fromInput', () => {
        it('should create a command with the latest action input from a provided signal', () => {
            const handler1 = jest.fn<() => void>();
            const handler2 = jest.fn();
            const handler3 = jest.fn();
            TestBed.runInInjectionContext(() => {
                const input = signal(handler1);

                const cmdSignal = command.fromInputSignal<void, void>(input);

                input.set(handler2);
                TestBed.tick();

                cmdSignal().trigger();

                input.set(handler3);
                TestBed.tick();

                cmdSignal().trigger();
                cmdSignal().trigger();
            });
            expect(handler1).toHaveBeenCalledTimes(0);
            expect(handler2).toHaveBeenCalledTimes(1);
            expect(handler3).toHaveBeenCalledTimes(2);
        });

        it('should create a command with mapped arguments', async () => {
            const result = await TestBed.runInInjectionContext(() => {
                const cmd = command.fromInput(
                    (args: { red: string }) => {
                        return args.red;
                    },
                    {
                        mapArguments: (args: { rosesAre: 'red' }) => {
                            return {
                                [args.rosesAre]: 'roses',
                            };
                        },
                    },
                );

                return cmd.triggerAsync({ rosesAre: 'red' });
            });

            expect(result).toBe('roses');
        });

        it('should pass through same instance of command', () => {
            TestBed.runInInjectionContext(() => {
                const cmd = command.action(() => {});
                const cmd2 = command.fromInput(cmd);
                expect(cmd).toBe(cmd2);
            });
        });

        it('should wrap AbstractCommand with command', () => {
            class MyCommand extends AbstractCommand<void, void> {
                error: unknown;
                result: void;

                constructor(public handler: Function) {
                    super();
                }

                override result$: Observable<void> = new Observable();
                override triggered$: Observable<void> = new Observable();
                override completed$: Observable<void> = new Observable();
                override busy$: Observable<boolean> = new Observable();
                override error$: Observable<Error> = new Observable();
                override triggerAsync: (args: void, triggerOptions?: CommandTriggerOptions) => Promise<false | void> =
                    () => {
                        this.handler();
                        return Promise.resolve(false);
                    };
                override cancel: () => void = () => {};
                override busy: boolean = false;
                override options: CommandOptions<void> = {};
            }

            TestBed.runInInjectionContext(() => {
                const cmd = new MyCommand(jest.fn());
                const cmd2 = command.fromInput(cmd);

                cmd2.trigger();

                expect(cmd2).not.toBe(cmd);
                expect(cmd.handler).toHaveBeenCalled();
            });
        });
    });

    describe('fromInputSignal', () => {
        it('should create a command with the latest action input from a provided signal', () => {
            TestBed.runInInjectionContext(() => {
                const handler1 = jest.fn<() => void>();
                const handler2 = jest.fn();
                const handler2Cmd = command.action(handler2);
                const handler3 = jest.fn();
                const input = signal<CommandInput<any, any>>(handler1);

                const cmdSignal = command.fromInputSignal<any, any>(input);

                input.set(handler2Cmd);
                TestBed.tick();

                cmdSignal().trigger();

                input.set(handler3);
                TestBed.tick();

                cmdSignal().trigger();
                cmdSignal().trigger();

                expect(handler1).toHaveBeenCalledTimes(0);
                expect(handler2).toHaveBeenCalledTimes(1);
                expect(handler3).toHaveBeenCalledTimes(2);
            });
        });

        it('should create a command with mapped arguments', async () => {
            const result = await TestBed.runInInjectionContext(() => {
                const handlerSignal = signal((args: { red: string }) => {
                    return args.red;
                });
                const cmdSignal = command.fromInputSignal(handlerSignal, {
                    mapArguments: (args: { rosesAre: 'red' }) => {
                        return {
                            [args.rosesAre]: 'roses',
                        };
                    },
                });

                return cmdSignal().triggerAsync({ rosesAre: 'red' });
            });

            expect(result).toBe('roses');
        });

        it('should pass through same instance of command', () => {
            TestBed.runInInjectionContext(() => {
                const cmd = signal(command.action(() => {}));
                const cmd2 = command.fromInputSignal(cmd);
                expect(cmd()).toBe(cmd2());
            });
        });
    });
});

