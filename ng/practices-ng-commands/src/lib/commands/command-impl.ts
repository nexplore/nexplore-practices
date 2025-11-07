import { Injector, runInInjectionContext, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, firstValueFrom, Observable, Subject, Unsubscribable } from 'rxjs';
import { ABORTED, AbstractCommand } from './abstract-command';
import { CommandWithSignalsAndStatus } from './command-internal.types';
import { CommandAsyncHandlerArg, CommandAsyncHandlerFn, CommandOptions, CommandTriggerOptions } from './command.types';

export class CommandImpl<TArgs, TResult, TOptions extends CommandOptions<TArgs> = CommandOptions<TArgs>>
    extends AbstractCommand<TArgs, TResult, TOptions>
    implements CommandWithSignalsAndStatus<TArgs, TResult>
{
    private readonly _resultSubject = new Subject<TResult>();
    private readonly _busySubject = new BehaviorSubject(false);
    private readonly _errorSubject = new Subject<Error>();
    private readonly _completedSubject = new Subject<void>();
    private readonly _triggeredSubject = new Subject<void>();
    private readonly _triggeringSubject = new BehaviorSubject<{ args: TArgs } | null>(null);

    private _subscription?: Unsubscribable;
    private _latestResult?: TResult;
    private _latestError?: Error | unknown;
    private _busySignal?: Signal<boolean>;
    private _resultSignal?: Signal<TResult | undefined>;
    private _errorSignal?: Signal<Error | undefined>;
    private _abortController?: AbortController;

    /** Observable with the results of the handler function */
    readonly result$ = this._resultSubject.asObservable();

    /** Observable emitting whenever the handler is triggered*/
    readonly triggered$ = this._triggeredSubject.asObservable();

    /** Observable emitting whenever the handler source observable completes or exits with error */
    readonly completed$ = this._completedSubject.asObservable();

    /** Observable of the current and future busy state */
    readonly busy$ = this._busySubject.asObservable();

    /** Observable emitting whenever the handler throws an error */
    readonly error$ = this._errorSubject.asObservable();

    get result(): TResult | undefined {
        return this._latestResult;
    }

    get busy(): boolean {
        return this._busySubject.value;
    }

    get error(): unknown | Error | undefined {
        return this._latestError;
    }

    get busySignal(): Signal<boolean> {
        if (!this._busySignal) {
            this._busySignal = untracked(() =>
                runInInjectionContext(this.injector, () => toSignal(this.busy$, { initialValue: this.busy }))
            );
        }
        return this._busySignal;
    }

    get resultSignal(): Signal<TResult | undefined> {
        if (!this._resultSignal) {
            this._resultSignal = untracked(() =>
                runInInjectionContext(this.injector, () =>
                    toSignal<TResult | undefined, TResult | undefined>(this.result$, {
                        initialValue: this._latestResult,
                    })
                )
            );
        }
        return this._resultSignal;
    }

    get errorSignal(): Signal<Error | undefined> {
        if (!this._errorSignal) {
            this._errorSignal = untracked(() =>
                runInInjectionContext(this.injector, () =>
                    toSignal(this.error$, { initialValue: this._latestError as Error })
                )
            );
        }
        return this._errorSignal;
    }

    constructor(
        public readonly injector: Injector,
        private _handler: CommandAsyncHandlerArg<TArgs, TResult>,
        readonly options: TOptions = {} as TOptions
    ) {
        super();
    }

    readonly triggerAsync = async (
        args: TArgs,
        triggerOptions?: CommandTriggerOptions
    ): Promise<TResult | typeof ABORTED> => {
        if (this.busy) {
            if (
                this.options?.concurrentTriggerBehavior?.onlyWhenParamsChanged &&
                this._triggeringSubject.value?.args === args
            ) {
                return this.result;
            }

            const getNotTriggeredValue = (): TResult | typeof ABORTED => {
                if (triggerOptions?.whenNotTriggeredBehavior === 'throw-error') {
                    throw new Error('Command was aborted because it was already running');
                } else if (triggerOptions?.whenNotTriggeredBehavior === 'return-last-result') {
                    return this.result;
                } else {
                    return ABORTED;
                }
            };

            switch (this.options?.concurrentTriggerBehavior?.type) {
                case 'waitForRunning': {
                    const triggerInstance = { args };
                    this._triggeringSubject.next(triggerInstance);
                    await firstValueFrom(this.completed$);
                    if (this._triggeringSubject.value !== triggerInstance) {
                        return getNotTriggeredValue();
                    }
                    break;
                }
                case 'cancelRunning':
                    this.cancel();
                    break;
                case 'ignore':
                default:
                    return getNotTriggeredValue();
            }
        }

        if (triggerOptions?.abortSignal) {
            if (triggerOptions.abortSignal.aborted) {
                return ABORTED;
            }

            // Connect the abort signal to our cancel function
            const cancel = (): void => {
                this.cancel();
                triggerOptions?.abortSignal?.removeEventListener('abort', cancel);
            };

            triggerOptions.abortSignal.addEventListener('abort', cancel);
        }

        this._abortController = new AbortController();

        let handlerFn: CommandAsyncHandlerFn<TArgs, TResult>;
        if (this._handler instanceof Observable) {
            const handlerObs = this._handler;
            // In case the provoded handler is actually an observable, create a function that subscribes to this observable
            handlerFn = () => handlerObs;
        } else {
            handlerFn = this._handler;
        }

        const options = this.options;
        try {
            this._latestError = undefined;
            this._triggeredSubject.next();

            if (options?.beforeExecuteHandler && options?.beforeExecuteHandler(args) === false) {
                return ABORTED;
            }

            this._busySubject.next(true);

            // Execute the handler function and check the result type
            const res = handlerFn(args, this._abortController.signal);

            if (res instanceof Promise) {
                // If promise, await it
                const result = await res;
                this._latestResult = result;
                this._resultSubject.next(result);
                this._busySubject.next(false);
                this._onComplete(options, args, result, undefined);
                return result;
            } else if (res instanceof Observable) {
                // if we have an observable, subscribe to it
                const result = await new Promise<TResult | undefined>((resolve, reject) => {
                    this._subscription = res.subscribe({
                        next: (res) => {
                            this._resultSubject.next(res);
                            this._latestResult = res;
                        },
                        error: (error: unknown) => {
                            this._latestError = error;
                            this._busySubject.next(false);
                            this._errorSubject.next(error as Error);
                            this._onComplete(options, args, undefined, error);
                            reject(error);
                        },
                        complete: () => {
                            this._busySubject.next(false);
                            this._onComplete(options, args, this._latestResult, undefined);
                            resolve(this._latestResult);
                        },
                    });
                });

                return result!;
            } else {
                // If the result was not an observable, directly complete with result
                this._latestResult = res;
                this._resultSubject.next(res);
                this._busySubject.next(false);
                this._onComplete(options, args, res, undefined);
                return res;
            }
        } catch (err) {
            this._latestError = err;
            this._errorSubject.next(err as Error);
            this._busySubject.next(false);
            this._onComplete(options, args, undefined, err);
            throw err;
        }
    };

    cancel = () => {
        if (this._subscription || this.busy) {
            if (this.options.isCancellable) {
                this._subscription?.unsubscribe();
                this._abortController?.abort();
            }
            this._subscription = undefined;
            this._busySubject.next(false);
            this._completedSubject.next();
            return true;
        } else {
            return false;
        }
    };

    private _onComplete(
        options: CommandOptions<TArgs> | undefined,
        args: TArgs,
        result: unknown | undefined,
        error: unknown | undefined
    ) {
        this._completedSubject.next();
        if (options?.afterExecuteHandler) {
            try {
                options.afterExecuteHandler({ args, result, error });
            } catch (err) {
                this._errorSubject.next(err as Error);
                return false;
            }
        }

        return true;
    }
}
