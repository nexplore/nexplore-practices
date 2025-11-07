import { AbstractCommand } from '@nexplore/practices-ng-commands';
import {
    BehaviorSubject,
    defer,
    from,
    Observable,
    of,
    shareReplay,
    Subject,
    take,
    takeUntil,
    tap,
    Unsubscribable,
} from 'rxjs';
import { LegacyCommandBase } from './command-base';
import { CombinedCommandInput, ILegacyCommand } from './command-interface.types';
import {
    LegacyCommandAsyncHandlerArg,
    LegacyCommandAsyncHandlerFn,
    LegacyCommandAsyncHandlerResult,
    LegacyCommandOptions,
    LegacyCommandTriggerOptions,
} from './command.types';
import { PassthroughCommand } from './passthrough-command';

/**
 * @deprecated
 *
 * This has been replaced by `command` api from `@nexplore/practices-ng-commands`.
 */
export class LegacyCommand<TArgs = void, TResult = unknown> extends LegacyCommandBase<TArgs, TResult> {
    private _subscription?: Unsubscribable;
    private _resultSubject = new Subject<TResult>();
    private _busySubject = new BehaviorSubject(false);
    private _errorSubject = new Subject<Error>();
    private _completedSubject = new Subject<void>();
    private _triggeredSubject = new Subject<void>();
    private _canExecute = true;

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

    /** Observable of the current and future canExecute state that was provided
     *
     * @deprecated CanExecute is no longer recommended, as it is considered not a good practice to disable buttons based on the state of the command.
     **/
    readonly canExecute$ = defer(() => this.options?.canExecute$ ?? of(true)).pipe(
        tap((canExecute) => {
            this._canExecute = canExecute;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    get busy() {
        return this._busySubject.value;
    }

    get canExecute() {
        return this._canExecute;
    }

    constructor(
        private _handler: LegacyCommandAsyncHandlerArg<TArgs, TResult>,
        readonly options?: LegacyCommandOptions<TArgs>
    ) {
        super();
    }

    /** Triggers the command, returning `true` if it was successfully triggered, and `false` if the command was already running or `canExecute` was `false`. */
    readonly trigger = (args?: TArgs, overrideOptions?: LegacyCommandTriggerOptions<TArgs>) => {
        this._ensureCanExecuteWasEvaluated();

        if (this.canExecute === false || this.busy) {
            return false;
        }

        let handlerFn: LegacyCommandAsyncHandlerFn<TArgs, TResult>;
        if (this._handler instanceof Observable) {
            const handlerObs = this._handler;
            // In case the provoded handler is actually an observable, create a function that subscribes to this observable
            handlerFn = () => handlerObs;
        } else {
            handlerFn = this._handler;
        }

        const options = overrideOptions ?? this.options;
        try {
            this._triggeredSubject.next();

            if (options?.beforeExecuteHandler && options?.beforeExecuteHandler(args!) === false) {
                return false;
            }

            this._busySubject.next(true);

            // Execute the handler function and check the result type
            let res = (handlerFn as any)(args);

            // If promise, wrap observable
            if (res instanceof Promise) {
                res = from(res);
            }

            // Finally, if we have an observable, subscribe to it
            if (res instanceof Observable) {
                let result: unknown;
                this._subscription = res.subscribe({
                    next: (res) => {
                        result = res;
                        this._resultSubject.next(res);
                    },
                    error: (error: unknown) => {
                        this._busySubject.next(false);
                        this._errorSubject.next(error as Error);
                        this._onComplete(options!, args!, undefined, error);
                    },
                    complete: () => {
                        this._busySubject.next(false);
                        this._onComplete(options, args!, result, undefined);
                    },
                });

                return true;
            } else {
                // If the result was not an observable, directly complete with result
                this._resultSubject.next(res);
                this._busySubject.next(false);
                return this._onComplete(options, args!, res, undefined);
            }
        } catch (err) {
            this._errorSubject.next(err as any);
            this._busySubject.next(false);
            this._onComplete(options, args!, undefined, err);
            return false;
        }
    };

    cancel = () => {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = undefined;
            this._busySubject.next(false);
            this._completedSubject.next();
            return true;
        } else {
            return false;
        }
    };

    private _onComplete(
        options: LegacyCommandTriggerOptions<TArgs> | undefined,
        args: TArgs,
        result: unknown | undefined,
        error: unknown | undefined
    ) {
        this._completedSubject.next();
        if (options?.afterExecuteHandler) {
            try {
                options.afterExecuteHandler({ args, result, error });
            } catch (err) {
                this._errorSubject.next(err as any);
                return false;
            }
        }

        return true;
    }

    private _ensureCanExecuteWasEvaluated() {
        // Temporarly subscribe to canExecute observable, to make sure the value will be initialized for accessing it on the line below (
        // This is, assuming that the observable immedeatly yields a value.
        // Notice this is only a fallback, since in most cases, the `canExecute$` is already subscribed to from the outside, and has already emmitted an value for the `_canExecute` property
        this.canExecute$.pipe(take(1), takeUntil(this._completedSubject)).subscribe();
    }

    /**
     * Creates a new command from a handler function.
     * The handler function can be sync or async, returning a promise or observable.
     *
     * If the handler function is async, the command will be busy while the handler is running.
     * If the handler function is sync, the command will be busy while the handler is running, and will be completed when the handler returns.
     *
     * If the handler function throws an error, the command will be completed with an error.
     *
     * The options for the command include:
     * - `canExecute$`: Optional observable yielding true if the command can be executed.
     * - `beforeExecuteHandler`: Optional handler that is executed before a command is run. If the function throws an error, it will be delegated to the commands error stream.
     * - `afterExecuteHandler`: Optional handler that is executed after a command is run.
     *
     * Further options provided will be passed to the `StatusService` to guide the visual representation of the command status.
     * - `statusCategory`: Optional status category to use when registed on the `StatusService`. If not provided, the default status category `action` will be used.
     * - `blocking`: If `true`, the running operation should block the user from interacting
     * - `progressMessage`: Allows to inform the user with a custom message regarding the progress
     * - `successMessage`: Set a success message for when the status reports success
     * - `errorMessage`: Set a custom error message for when the status reports an error
     * - `silent`: If `true`, the progress will not be shown (eg. no busy spinner).
     *
     * Example:
     * ```ts
     * const saveCmmand = Command.create(() => {
     *    return timer(10000).pipe(map(() => 'Hello World'));
     * }, {
     *   statusCategory: 'action-save', // When used with `puibe-status-hub`, this will be used to show a 'saving...' message and a 'successfully saved!'-toast.
     *   canExecute$: this.form.valid$, // Only allow execution when the form is valid
     * });
     * ```
     *
     * @param handler The handler function, sync or async, returning a promise or observable
     * @param options Optional options for the command
     * @returns a new command
     */
    static create<TArgs = void, TResult = void>(
        handler: LegacyCommandAsyncHandlerArg<TArgs, TResult>,
        options?: LegacyCommandOptions<TArgs>
    ) {
        return new LegacyCommand<TArgs, TResult>(handler, options);
    }

    /**
     * @deprecated
     *
     * Creates a command from a command or handler function.
     *
     * If the provided argument is a `Command`, it will be returned as-is.
     * If the provided argument is a function, it will be wrapped in a `Command`.
     * If the provided argument is a `Command`, and `defaultOptions` are provided, it will be wrapped in a `PassthroughCommand` with the provided `defaultOptions`.
     *
     * If an existing command is provided with new `defaultOptions`, the `defaultOptions` will be merged with the existing command's options.
     * For the option `beforeExecuteHandler`, the inner command's handler will be called first, and if it returns `false`, the default handler will not be called.
     * For the option `afterExecuteHandler`, the default handler will be called first, and then the inner command's handler.
     *
     * @param commandOrHandler A command or handler function (sync or async, returing a promise or observable)
     * @param defaultOptions The default options to apply when the inner command has not specified them
     * @returns a new command or the provided command if it was already a command and no `defaultOptions` were provided
     */
    static from<TArgs = void, TResult = void>(
        commandOrHandler:
            | CombinedCommandInput<TArgs, TResult>
            | AbstractCommand<TArgs, TResult>
            | LegacyCommandBase<TArgs, TResult>
            | LegacyCommandAsyncHandlerFn<TArgs, TResult>
            | LegacyCommandAsyncHandlerResult<TResult>
            | ILegacyCommand<TArgs, TResult>,
        defaultOptions?: LegacyCommandOptions<TArgs>
    ): LegacyCommandBase<TArgs, TResult> {
        if (commandOrHandler instanceof AbstractCommand) {
            return LegacyCommand.from<TArgs, TResult>(
                (args: any) => commandOrHandler.triggerAsync(args as TArgs) as Promise<TResult>,
                defaultOptions
            );
        } else if (commandOrHandler instanceof LegacyCommandBase) {
            if (defaultOptions) {
                return LegacyCommand.withDefaultOptions<TArgs, TResult>(commandOrHandler, defaultOptions);
            } else {
                return commandOrHandler;
            }
        } else if (commandOrHandler instanceof Function) {
            return new LegacyCommand(commandOrHandler as any, defaultOptions);
        } else {
            return new LegacyCommand<TArgs, TResult>(() => commandOrHandler as TResult, defaultOptions);
        }
    }

    /**
     * Wraps the command with a `PassthroughCommand`, adding default options that apply when the innerCommand has not specified them.
     *
     * For the option `beforeExecuteHandler`, the inner command's handler will be called first, and if it returns `false`, the default handler will not be called.
     * For the option `afterExecuteHandler`, the default handler will be called first, and then the inner command's handler.
     *
     * @param innerCommand the command to wrap
     * @param defaultOptions the default options to apply when the inner command has not specified them
     * @returns a new command that wraps the inner command
     */
    static withDefaultOptions<TArgs = void, TResult = void>(
        innerCommand: LegacyCommandBase<TArgs, TResult>,
        defaultOptions: LegacyCommandOptions<TArgs>
    ) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new PassthroughCommand<TArgs, TResult>(innerCommand, defaultOptions);
    }
}
