/* eslint-disable */
import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { StatusEvent, StatusHubService } from '@nexplore/practices-ng-status';
import { distinctUntilChanged, Observable, Subject, Subscription, timer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { createCommandWithSignalsAndStatus } from './create-command-with-signals-and-status-util';

function expectToBeCalledBefore(fn0: jest.Mock, fn1: jest.Mock) {
    expect(fn0).toHaveBeenCalled();
    expect(fn1).toHaveBeenCalled();
    const calls0 = fn0.mock.invocationCallOrder;
    const calls1 = fn1.mock.invocationCallOrder;
    expect(calls0).toBeDefined();
    expect(calls1).toBeDefined();
    expect(calls0[0]).toBeLessThan(calls1[0]);
}

describe('createCommandWithSignalsAndStatus', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('should run handler', () => {
        TestBed.runInInjectionContext(() => {
            const handler = jest.fn<() => void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler);
            cmd.trigger();
            expect(handler).toHaveBeenCalled();
        });
    });

    it('should receive result from triggerAsync with promise resolve', async () => {
        await TestBed.runInInjectionContext(async () => {
            const handler = jest.fn<() => Promise<number>>(() => Promise.resolve(42));
            const cmd = createCommandWithSignalsAndStatus(handler);
            const result = await cmd.triggerAsync();
            expect(result).toBe(42);
        });
    });

    it('should receive result from triggerAsync with sync result', async () => {
        await TestBed.runInInjectionContext(async () => {
            const handler = jest.fn<() => number>(() => 42);
            const cmd = createCommandWithSignalsAndStatus(handler);
            const result = await cmd.triggerAsync();
            expect(result).toBe(42);
        });
    });

    it('should receive result from triggerAsync with observable timer', async () => {
        await TestBed.runInInjectionContext(async () => {
            jest.useRealTimers();
            const handler = jest.fn<() => Observable<number>>(() => timer(1).pipe(map(() => 42)));
            const cmd = createCommandWithSignalsAndStatus(handler);
            const result = await cmd.triggerAsync();
            expect(result).toBe(42);
        });
    });

    it('should receive result from triggerAsync with fake async method', async () => {
        await TestBed.runInInjectionContext(async () => {
            const handler = async () => 42;
            const cmd = createCommandWithSignalsAndStatus(handler);
            const result = await cmd.triggerAsync();
            expect(result).toBe(42);
        });
    });

    it('should not run async handler while command is still executing', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const handler = jest.fn(() => subject);
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler);
            cmd.trigger();
            cmd.trigger();
            subject.complete();
            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    it('should run async handler again after command has completed', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const handler = jest.fn(() => subject);
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler);
            cmd.trigger();
            subject.complete();
            cmd.trigger();
            expect(handler).toHaveBeenCalledTimes(2);
        });
    });

    it('should run beforeExecuteHandler before handler', () => {
        TestBed.runInInjectionContext(() => {
            const beforeExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, { beforeExecuteHandler });
            cmd.trigger();
            expectToBeCalledBefore(beforeExecuteHandler, handler);
        });
    });

    it('should run afterExecuteHandler after handler', () => {
        TestBed.runInInjectionContext(() => {
            const afterExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, { afterExecuteHandler });
            cmd.trigger();
            expectToBeCalledBefore(handler, afterExecuteHandler);
        });
    });

    it('should run afterExecuteHandler even if handler throws', () => {
        TestBed.runInInjectionContext(() => {
            const afterExecuteHandler = jest.fn<() => void>();
            const handler = () => {
                throw new Error();
            };
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, { afterExecuteHandler });
            cmd.trigger();
            expect(afterExecuteHandler).toHaveBeenCalled();
        });
    });

    it('should run afterExecuteHandler even if beforeExecuteHandler throws', () => {
        TestBed.runInInjectionContext(() => {
            const afterExecuteHandler = jest.fn<() => void>();
            const beforeExecuteHandler = () => {
                throw new Error();
            };
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {}, {
                afterExecuteHandler,
                beforeExecuteHandler,
            });
            cmd.trigger();
            expect(afterExecuteHandler).toHaveBeenCalled();
        });
    });

    it('should return stream of busy$', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => subject);
            const isExecutingValues: boolean[] = [];
            cmd.busy$.subscribe((value) => isExecutingValues.push(value));
            cmd.trigger();
            subject.complete();
            cmd.trigger();
            expect(isExecutingValues).toEqual([false, true, false, true, false]);
        });
    });

    it('should return stream of busy$ even if handler throws', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {
                throw new Error();
            });
            const isExecutingValues: boolean[] = [];
            cmd.busy$.subscribe((value) => isExecutingValues.push(value));
            cmd.trigger();
            expect(isExecutingValues).toEqual([false, true, false]);
        });
    });

    it('should return stream of completed$', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => subject);
            const isCompletedValues: boolean[] = [];
            cmd.completed$.subscribe((value) => isCompletedValues.push(true));
            cmd.trigger();
            subject.complete();
            expect(isCompletedValues).toEqual([true]);
        });
    });

    it('should return stream of completed$ even if handler throws', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {
                throw new Error();
            });
            const isCompletedValues: boolean[] = [];
            cmd.completed$.subscribe((value) => isCompletedValues.push(true));
            cmd.trigger();
            expect(isCompletedValues).toEqual([true]);
        });
    });

    it('should return stream of error$', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => subject);
            const errorValues: Error[] = [];
            const err = new Error();
            cmd.error$.subscribe((err) => errorValues.push(err));
            cmd.trigger();
            subject.error(err);
            expect(errorValues).toEqual([err]);
        });
    });

    it('should return stream of error$ even if sync handler throws', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {
                throw new Error();
            });
            const errorValues: Error[] = [];
            const err = new Error();
            cmd.error$.subscribe((err) => errorValues.push(err));
            cmd.trigger();
            expect(errorValues).toEqual([err]);
        });
    });

    it('should return stream of error$ even if beforeExecuteHandler throws', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {}, {
                beforeExecuteHandler: () => {
                    throw new Error();
                },
            });
            const errorValues: Error[] = [];
            const err = new Error();
            cmd.error$.subscribe((err) => errorValues.push(err));
            cmd.trigger();
            expect(errorValues).toEqual([err]);
        });
    });

    it('should return stream of error$ even if sync afterExecuteHandler throws', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {}, {
                afterExecuteHandler: () => {
                    throw new Error();
                },
            });
            const errorValues: Error[] = [];
            const err = new Error();
            cmd.error$.subscribe((err) => errorValues.push(err));
            cmd.trigger();
            expect(errorValues).toEqual([err]);
        });
    });

    it('should unsubscribe from handler returned observable when cancel() is called and isCancellable is true', () => {
        TestBed.runInInjectionContext(() => {
            const subscription = new Subscription();
            const handler = jest.fn(() => new Observable(() => subscription));
            const cmd = createCommandWithSignalsAndStatus(handler, { isCancellable: true });
            cmd.trigger();

            cmd.cancel();
            expect(subscription.closed).toBeTruthy();
        });
    });

    it('should not unsubscribe from handler returned observable when cancel() is called and isCancellable is false', () => {
        TestBed.runInInjectionContext(() => {
            const subscription = new Subscription();
            const handler = jest.fn(() => new Observable(() => subscription));
            const cmd = createCommandWithSignalsAndStatus(handler, { isCancellable: false });
            cmd.trigger();

            cmd.cancel();
            expect(subscription.closed).toBeFalsy();
        });
    });

    it('should emit completed$ when cancel() is called', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => subject);
            const isCompletedValues: boolean[] = [];
            cmd.completed$.subscribe((value) => isCompletedValues.push(true));
            cmd.trigger();
            cmd.cancel();
            expect(isCompletedValues).toEqual([true]);
        });
    });

    it('should run inner beforeExecuteHandler before outer beforeExecuteHandler', () => {
        TestBed.runInInjectionContext(() => {
            const outerBeforeExecuteHandler = jest.fn<() => void>();
            const innerBeforeExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, {
                beforeExecuteHandler: outerBeforeExecuteHandler,
            });
            cmd.addOnBeforeExecuteHandler(innerBeforeExecuteHandler);
            cmd.trigger();

            expectToBeCalledBefore(innerBeforeExecuteHandler, outerBeforeExecuteHandler);
        });
    });

    it('should run outer afterExecuteHandler before inner afterExecuteHandler', () => {
        TestBed.runInInjectionContext(() => {
            const outerAfterExecuteHandler = jest.fn<() => void>();
            const innerAfterExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, {
                afterExecuteHandler: outerAfterExecuteHandler,
            });
            cmd.addOnAfterExecuteHandler(innerAfterExecuteHandler);
            cmd.trigger();

            expectToBeCalledBefore(innerAfterExecuteHandler, outerAfterExecuteHandler);
        });
    });

    it('should execute all beforeExecuteHandlers even after calling multiple addOnAfterExecuteHandler', () => {
        TestBed.runInInjectionContext(() => {
            const result: number[] = [];

            const innerBeforeExecuteHandler = () => {
                result.push(0);
            };
            const outerBeforeExecuteHandler = () => {
                result.push(1);
            };
            const outerBeforeExecuteHandler2 = () => {
                result.push(2);
            };
            const handler = jest.fn<() => void>().mockName('handler');
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler, {
                beforeExecuteHandler: innerBeforeExecuteHandler,
            });

            cmd.addOnBeforeExecuteHandler(outerBeforeExecuteHandler);
            cmd.addOnBeforeExecuteHandler(outerBeforeExecuteHandler2);
            cmd.trigger();

            expect(handler).toHaveBeenCalled();

            expect(result).toEqual([2, 1, 0]);
        });
    });

    it('should not throw when calling trigger and error is thrown sync', () => {
        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus<void, void>(() => {
                throw new Error();
            });

            expect(() => cmd.trigger()).not.toThrow();
        });
    });

    it('should set error signal', () => {
        const results: any[] = [];
        TestBed.runInInjectionContext(() => {
            const handler = () => {
                throw new Error('error');
            };
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler);

            effect(() => {
                results.push(cmd.errorSignal());
            });

            TestBed.tick();

            cmd.trigger();

            TestBed.tick();
        });
        expect(results).toEqual([undefined, new Error('error')]);
    });

    it('should set busy signal', () => {
        const results: any[] = [];
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<void>();
            const handler = () => subject;
            const cmd = createCommandWithSignalsAndStatus<void, void>(handler);

            effect(() => {
                const result = cmd.busySignal();
                results.push(result);
            });

            TestBed.tick();
            cmd.trigger();
            TestBed.tick();
            subject.complete();
            TestBed.tick();
        });

        expect(results).toEqual([false, true, false]);
    });

    it('should set result signal', () => {
        const results: any[] = [];
        TestBed.runInInjectionContext(() => {
            const handler = () => 1;
            const cmd = createCommandWithSignalsAndStatus(handler);

            effect(() => {
                const result = cmd.resultSignal();
                results.push(result);
            });

            cmd.trigger();
            TestBed.tick();
        });

        expect(results).toEqual([1]);
    });

    it('should register status busy operation', () => {
        jest.useFakeTimers();
        const results: any[] = [];
        TestBed.overrideProvider(StatusHubService, {
            useValue: {
                register: (obs: Observable<StatusEvent>) =>
                    obs
                        .pipe(
                            finalize(() => results.push('completed')),
                            map((ev) => ev.busy),
                            distinctUntilChanged(),
                        )
                        .subscribe((busy) => results.push(busy)),
            },
        });

        TestBed.runInInjectionContext(() => {
            const resultSubject = new Subject<void>();
            const cmd = createCommandWithSignalsAndStatus(() => resultSubject);

            cmd.trigger();

            jest.runAllTimers();

            resultSubject.complete();

            jest.runAllTimers();
        });

        expect(results).toEqual([false, true, false, 'completed']);
    });

    it('should register status error', () => {
        const results: any[] = [];
        TestBed.overrideProvider(StatusHubService, {
            useValue: {
                register: (obs: Observable<StatusEvent>) =>
                    obs
                        .pipe(
                            finalize(() => results.push('completed')),
                            map((ev) => ev.error),
                            distinctUntilChanged(),
                        )
                        .subscribe((err) => results.push(err)),
            },
        });

        TestBed.runInInjectionContext(() => {
            const cmd = createCommandWithSignalsAndStatus(() => {
                throw new Error('error');
            });

            jest.runAllTimers();
            cmd.trigger();
            jest.runAllTimers();
        });

        expect(results).toEqual([undefined, new Error('error'), 'completed']);
    });
});

