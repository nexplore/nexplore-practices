import { WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractCommand } from './abstract-command';
import { CommandWithLifecycleOptions, CommandWithSignalsAndStatus, ILegacyCommand } from './command-internal.types';

export interface CommandAfterExecuteResult<TArgs = void | never | undefined> {
    args: TArgs;
    result?: unknown;
    error?: unknown;
}

export type ConcurrentTriggerBehaviorType = 'waitForRunning' | 'cancelRunning' | 'ignore';

export type ConcurrentTriggerBehavior = {
    /**
     * Defines the behavior when a command is triggered while it is still is running.
     *
     * - `waitForRunning`: Waits for the running command to complete, then re-triggers.
     * - `cancelRunning`: Cancels the running command and re-triggers.
     * - `ignore`: Ignores the trigger if the command is still running.
     */
    type: ConcurrentTriggerBehaviorType;

    /**
     * If true, the command will only be re-triggered if the parameters have changed.
     */
    onlyWhenParamsChanged?: boolean;
};

export type CommandTriggerOptions = {
    abortSignal?: AbortSignal;

    whenNotTriggeredBehavior?: 'return-undefined' | 'return-last-result' | 'throw-error';
};

export type CommandAsyncHandlerResult<T> = Observable<T> | Promise<T> | T;
export type CommandAsyncHandlerFn<TArgs, TResult> = (
    args: TArgs,
    abortSignal: AbortSignal
) => CommandAsyncHandlerResult<TResult>;

export type CommandAsyncHandlerArg<TArgs, TResult> = CommandAsyncHandlerFn<TArgs, TResult>;

export type Command<TArgs = void, TResult = void> = CommandWithSignalsAndStatus<TArgs, TResult>;

export type CommandInput<TArgs = any, TResult = unknown> =
    | AbstractCommand<TArgs, TResult>
    | CommandAsyncHandlerFn<TArgs, TResult>
    | ILegacyCommand<TArgs, TResult>;

export type CommandOptions<TArgs> = CommandWithLifecycleOptions<TArgs>;
export type ActionCommand<TArgs, TResult> = CommandWithSignalsAndStatus<TArgs, TResult>;
export type QueryCommand<TArgs, TResult> = CommandWithSignalsAndStatus<TArgs, TResult> & {
    /**
     * Makes the query `resultSignal` writable.
     *
     * This is usable in cases when you also want to set the result manually, for example:
     *
     * ```ts
     * readonly myQuery = command.query.withAutoTrigger(() => fetchSomethingFromServerAsync()).withMutableResult();
     *
     * async onClickAddItem() {
     *   const result = await addItemToServerAsync();
     *
     *   // Add the new item to the already loaded result
     *   // Note: Alternatively you could retrigger the whole query, but this approach saves a network request
     *   this.myQuery.resultSignal.update(items => [...items, result]);
     * }
     */
    readonly withMutableResult: () => CommandWithSignalsAndStatus<TArgs, TResult> & {
        resultSignal: WritableSignal<TResult | undefined>;
    };
};
export type QueryOptions<TArgs> = CommandWithLifecycleOptions<TArgs>;
