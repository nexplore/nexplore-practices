/* eslint-disable */
import { describe, expect, it, jest } from '@jest/globals';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { LegacyCommand } from './command';

describe('Command', () => {
    it('should run handler', () => {
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler);
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(true);
        expect(handler).toHaveBeenCalled();
    });

    it('should not run handler if canExecute observable is false', () => {
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { canExecute$: of(false) });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(false);
        expect(handler).not.toHaveBeenCalled();
    });

    it('should run handler if canExecute observable is true', () => {
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { canExecute$: of(true) });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(true);
        expect(handler).toHaveBeenCalled();
    });

    it('should not run async handler while command is still executing', () => {
        const subject = new Subject<void>();
        const handler = jest.fn(() => subject);
        const command = LegacyCommand.create(handler);
        const wasTriggered0 = command.trigger();
        const wasTriggered1 = command.trigger();
        expect(wasTriggered0).toBe(true);
        expect(wasTriggered1).toBe(false);
        subject.complete();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should run async handler again after command has completed', () => {
        const subject = new Subject<void>();
        const handler = jest.fn(() => subject);
        const command = LegacyCommand.create(handler);
        const wasTriggered0 = command.trigger();
        subject.complete();
        const wasTriggered1 = command.trigger();
        expect(wasTriggered0).toBe(true);
        expect(wasTriggered1).toBe(true);
    });

    it('should run beforeExecuteHandler before handler', () => {
        const beforeExecuteHandler = jest.fn<() => void>();
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { beforeExecuteHandler });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(true);
        expectToBeCalledBefore(beforeExecuteHandler, handler);
    });

    it('should run afterExecuteHandler after handler', () => {
        const afterExecuteHandler = jest.fn<() => void>();
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { afterExecuteHandler });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(true);
        expectToBeCalledBefore(handler, afterExecuteHandler);
    });

    it('should run afterExecuteHandler even if handler throws', () => {
        const afterExecuteHandler = jest.fn<() => void>();
        const handler = () => {
            throw new Error();
        };
        const command = LegacyCommand.create(handler, { afterExecuteHandler });
        expect(command.trigger()).toEqual(false);
        expect(afterExecuteHandler).toHaveBeenCalled();
    });

    it('should run afterExecuteHandler even if beforeExecuteHandler throws', () => {
        const afterExecuteHandler = jest.fn<() => void>();
        const beforeExecuteHandler = () => {
            throw new Error();
        };
        const command = LegacyCommand.create(() => {}, { afterExecuteHandler, beforeExecuteHandler });
        expect(command.trigger()).toEqual(false);
        expect(afterExecuteHandler).toHaveBeenCalled();
    });

    it('should not run handler if canExecute observable is false', () => {
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { canExecute$: of(false) });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(false);
        expect(handler).not.toHaveBeenCalled();
    });

    it('should run handler if canExecute observable is true', () => {
        const handler = jest.fn<() => void>();
        const command = LegacyCommand.create(handler, { canExecute$: of(true) });
        const wasTriggered = command.trigger();
        expect(wasTriggered).toBe(true);
        expect(handler).toHaveBeenCalled();
    });

    it('should return stream of canExecute', () => {
        const canExecute = new Subject<boolean>();
        const command = LegacyCommand.create(() => {}, { canExecute$: canExecute });
        const canExecuteValues: boolean[] = [];
        command.canExecute$.subscribe((value) => canExecuteValues.push(value));
        canExecute.next(false);
        canExecute.next(true);
        canExecute.next(false);
        expect(canExecuteValues).toEqual([false, true, false]);
    });

    it('should return stream of busy$', () => {
        const subject = new Subject<void>();
        const command = LegacyCommand.create(() => subject);
        const isExecutingValues: boolean[] = [];
        command.busy$.subscribe((value) => isExecutingValues.push(value));
        command.trigger();
        subject.complete();
        command.trigger();
        expect(isExecutingValues).toEqual([false, true, false, true, false]);
    });

    it('should return stream of busy$ even if handler throws', () => {
        const command = LegacyCommand.create(() => {
            throw new Error();
        });
        const isExecutingValues: boolean[] = [];
        command.busy$.subscribe((value) => isExecutingValues.push(value));
        expect(command.trigger()).toEqual(false);
        expect(isExecutingValues).toEqual([false, true, false]);
    });

    it('should return stream of completed$', () => {
        const subject = new Subject<void>();
        const command = LegacyCommand.create(() => subject);
        const isCompletedValues: boolean[] = [];
        command.completed$.subscribe((value) => isCompletedValues.push(true));
        command.trigger();
        subject.complete();
        expect(isCompletedValues).toEqual([true]);
    });

    it('should return stream of completed$ even if handler throws', () => {
        const command = LegacyCommand.create(() => {
            throw new Error();
        });
        const isCompletedValues: boolean[] = [];
        command.completed$.subscribe((value) => isCompletedValues.push(true));
        expect(command.trigger()).toEqual(false);
        expect(isCompletedValues).toEqual([true]);
    });

    it('should return stream of error$', () => {
        const subject = new Subject<void>();
        const command = LegacyCommand.create(() => subject);
        const errorValues: Error[] = [];
        const err = new Error();
        command.error$.subscribe((err) => errorValues.push(err));
        command.trigger();
        subject.error(err);
        expect(errorValues).toEqual([err]);
    });

    it('should return stream of error$ even if sync handler throws', () => {
        const command = LegacyCommand.create(() => {
            throw new Error();
        });
        const errorValues: Error[] = [];
        const err = new Error();
        command.error$.subscribe((err) => errorValues.push(err));
        expect(command.trigger()).toEqual(false);
        expect(errorValues).toEqual([err]);
    });

    it('should return stream of error$ even if beforeExecuteHandler throws', () => {
        const command = LegacyCommand.create(() => {}, {
            beforeExecuteHandler: () => {
                throw new Error();
            },
        });
        const errorValues: Error[] = [];
        const err = new Error();
        command.error$.subscribe((err) => errorValues.push(err));
        expect(command.trigger()).toEqual(false);
        expect(errorValues).toEqual([err]);
    });

    it('should return stream of error$ even if sync afterExecuteHandler throws', () => {
        const command = LegacyCommand.create(() => {}, {
            afterExecuteHandler: () => {
                throw new Error();
            },
        });
        const errorValues: Error[] = [];
        const err = new Error();
        command.error$.subscribe((err) => errorValues.push(err));
        expect(command.trigger()).toEqual(false);
        expect(errorValues).toEqual([err]);
    });

    it.skip('should return stream of error$ even if canExecute observable throws', () => {
        const command = LegacyCommand.create(() => {}, {
            canExecute$: new Subject().pipe(() => {
                throw new Error();
            }),
        });
        const errorValues: Error[] = [];
        const err = new Error();
        command.error$.subscribe((err) => errorValues.push(err));
        expect(command.trigger()).toEqual(false);
        expect(errorValues).toEqual([err]);
    });

    it('should unsubscribe from handler returned observable when cancel() is called', () => {
        const subscription = new Subscription();
        const handler = jest.fn(() => new Observable(() => subscription));
        const command = LegacyCommand.create(handler);
        command.trigger();

        command.cancel();
        expect(subscription.closed).toBeTruthy();
    });

    it('should emit completed$ when cancel() is called', () => {
        const subject = new Subject<void>();
        const command = LegacyCommand.create(() => subject);
        const isCompletedValues: boolean[] = [];
        command.completed$.subscribe((value) => isCompletedValues.push(true));
        command.trigger();
        command.cancel();
        expect(isCompletedValues).toEqual([true]);
    });

    describe('withDefaultOptions', () => {
        it('should merge options keeping the original options where defined', () => {
            const handler = jest.fn<() => void>();
            const command = LegacyCommand.create(handler, { canExecute$: of(true) });
            const commandWithDefaultOptions = LegacyCommand.withDefaultOptions(command, { canExecute$: of(false) });
            const wasTriggered = commandWithDefaultOptions.trigger();
            expect(wasTriggered).toBe(true);
            expect(handler).toHaveBeenCalled();
        });

        it('should run inner beforeExecuteHandler before outer beforeExecuteHandler', () => {
            const outerBeforeExecuteHandler = jest.fn<() => void>();
            const innerBeforeExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const command = LegacyCommand.create(handler, { beforeExecuteHandler: innerBeforeExecuteHandler });
            const commandWithDefaultOptions = LegacyCommand.withDefaultOptions(command, {
                beforeExecuteHandler: outerBeforeExecuteHandler,
            });
            const wasTriggered = commandWithDefaultOptions.trigger();
            expect(wasTriggered).toBe(true);

            expectToBeCalledBefore(innerBeforeExecuteHandler, outerBeforeExecuteHandler);
        });

        it('should run outer afterExecuteHandler before inner afterExecuteHandler', () => {
            const outerAfterExecuteHandler = jest.fn<() => void>();
            const innerAfterExecuteHandler = jest.fn<() => void>();
            const handler = jest.fn<() => void>();
            const command = LegacyCommand.create(handler, { afterExecuteHandler: innerAfterExecuteHandler });
            const commandWithDefaultOptions = LegacyCommand.withDefaultOptions(command, {
                afterExecuteHandler: outerAfterExecuteHandler,
            });
            const wasTriggered = commandWithDefaultOptions.trigger();
            expect(wasTriggered).toBe(true);

            expectToBeCalledBefore(outerAfterExecuteHandler, innerAfterExecuteHandler);
        });

        it('should execute all beforeExecuteHandlers even after chaining multiple `withDefaultOptions` ', () => {
            const outerBeforeExecuteHandler = jest.fn<() => void>().mockName('outerBeforeExecuteHandler');
            const outerBeforeExecuteHandler2 = jest.fn<() => void>().mockName('outerBeforeExecuteHandler2');
            const innerBeforeExecuteHandler = jest.fn<() => void>().mockName('innerBeforeExecuteHandler');
            const handler = jest.fn<() => void>().mockName('handler');
            const command = LegacyCommand.create(handler, { beforeExecuteHandler: innerBeforeExecuteHandler });
            const commandWithDefaultOptions = LegacyCommand.withDefaultOptions(command, {
                beforeExecuteHandler: outerBeforeExecuteHandler,
            });
            const commandWithDefaultOptions2 = LegacyCommand.withDefaultOptions(commandWithDefaultOptions, {
                beforeExecuteHandler: outerBeforeExecuteHandler2,
            });

            const wasTriggered = commandWithDefaultOptions2.trigger();
            expect(wasTriggered).toBe(true);
            expect(handler).toHaveBeenCalled();

            expectToBeCalledBefore(innerBeforeExecuteHandler, outerBeforeExecuteHandler);
            expectToBeCalledBefore(innerBeforeExecuteHandler, outerBeforeExecuteHandler2);
            expectToBeCalledBefore(outerBeforeExecuteHandler, outerBeforeExecuteHandler2);
        });
    });
});

function expectToBeCalledBefore(fn0: jest.Mock, fn1: jest.Mock) {
    expect(fn0).toHaveBeenCalled();
    expect(fn1).toHaveBeenCalled();
    const calls0 = fn0.mock.invocationCallOrder;
    const calls1 = fn1.mock.invocationCallOrder;
    expect(calls0).toBeDefined();
    expect(calls1).toBeDefined();
    expect(calls0[0]).toBeLessThan(calls1[0]);
}
