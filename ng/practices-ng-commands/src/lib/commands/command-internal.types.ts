import { Signal } from '@angular/core';
import { StatusProgressOptions } from '@nexplore/practices-ng-status';
import { Observable } from 'rxjs';
import { AbstractCommand } from './abstract-command';
import { CommandAfterExecuteResult, ConcurrentTriggerBehavior } from './command.types';

export interface AbstractCommandOptions<TArgs = void> {
    /**
     * If true, when `cancel` is called, the commands underlying action will be cancelled too.
     *
     * Otherwise, the command will simply stop producing a result, but the action will continue to run.
     *
     * Notice, cancellation is supported in two fashions:
     * - If the underlying action is a `Observable`, it will be automatically unsubscribed when `cancel` is called.
     * - Also, an `AbortSignal` is passed to the actions second parameter, which will be triggered when the command is cancelled.
     */
    isCancellable?: boolean;

    /**
     * The behavior when the command is triggered while it is still running.
     */
    concurrentTriggerBehavior?: ConcurrentTriggerBehavior;

    /**
     * Optional handler that is executed before a command is run.
     *
     * If the function throws an error, it will be delegated to the commands error stream.
     *
     * @returns a boolean, that when false, the command will not be run
     */
    beforeExecuteHandler?: (args: TArgs) => boolean | void;

    /**
     * Optional handler that is executed after a command is run.
     */
    afterExecuteHandler?: (params: CommandAfterExecuteResult<TArgs>) => void;
}

export type CommandWithLifecycleOptions<TArgs> =
    | AbstractCommandOptions<TArgs> & {
          /**
           * Shorthand for `concurrentTriggerBehavior: { type: 'waitForRunning' }`.
           *
           * If true, triggering the command while it is still running will wait for the running command to complete, then re-trigger.
           * If triggered more than once while running, only the last trigger will succeed.
           */
          waitForRunning?: boolean;

          /**
           * The status options for the command.
           */
          status?: StatusProgressOptions;
      };

export type CommandWithSignalsAndStatus<TArgs, TResult> = AbstractCommand<
    TArgs,
    TResult,
    CommandWithLifecycleOptions<TArgs>
> & {
    /**
     * Signal that emits the current busy state of the command.
     */
    readonly busySignal: Signal<boolean>;

    /**
     * Signal that emits the latest result as produced by the last invocation of the command.
     */
    readonly resultSignal: Signal<TResult | undefined>;

    /**
     * Returns the latest result as produced by the last invocation of the command.
     *
     * NOTE: If you need to read the last result in a template, use the `lastResultSignal` instead, because this getter is not tracked by Angular change detection.
     */
    readonly result: TResult | undefined;

    /**
     * Signal that emits the latest error as produced by the last invocation of the command.
     */
    readonly errorSignal: Signal<Error | undefined>;
};

/* @deprecated */
export interface ILegacyCommand<TArgs, TResult> {
    /** Observable with the results of the handler function */
    readonly result$: Observable<TResult>;

    /** Observable emitting whenever the handler is triggered*/
    readonly triggered$: Observable<void>;

    /** Observable emitting whenever the handler source observable completes or exits with error */
    readonly completed$: Observable<void>;

    /** Observable of the current and future busy state */
    readonly busy$: Observable<boolean>;

    /** Observable emitting whenever the handler throws an error */
    readonly error$: Observable<Error>;

    /** Observable of the current and future canExecute state that was provided  */
    readonly canExecute$: Observable<boolean>;

    trigger: (args?: TArgs, overrideOptions?: any) => boolean;

    cancel: () => void;

    readonly busy: boolean;

    readonly canExecute: boolean;

    readonly options?: any;
}
