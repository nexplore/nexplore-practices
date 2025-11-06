import { CommandAfterExecuteResult, CommandAsyncHandlerResult } from '@nexplore/practices-ng-commands';
import { Observable } from 'rxjs';
import { ErrorMessage, StatusCategory, StatusProgressOptions, SuccessMessage } from '../status/model';

/**
 * @deprecated import `CommandOptions` from `@nexplore/practices-ng-commands` instead
 */
export interface LegacyCommandOptions<TArgs = void> extends StatusProgressOptions {
    /**
     * Optional observable yielding true if the command can be executed.
     *
     * @deprecated CanExecute is no longer recommended, as it is considered not a good practice to disable buttons based on the state of the command.
     */
    canExecute$?: Observable<boolean>;

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

export type LegacyCommandOptionsWithDeprecations<TArgs> = LegacyCommandOptions<TArgs> & {
    /** @deprecated Set via `status` */
    blocking?: boolean;

    /** @deprecated Set via `status` */
    progressMessage?: string | Observable<string>;

    /** @deprecated Set via `status` */
    successMessage?: SuccessMessage;

    /** @deprecated Set via `status` */
    errorMessage?: ErrorMessage;

    /** @deprecated Set via `status` */
    silent?: boolean;

    /** @deprecated Set via `status` */
    statusCategory?: StatusCategory;

    /** @deprecated Set via `status` */
    autohide?: boolean;
};

export type LegacyCommandTriggerOptions<TArgs> = Pick<
    LegacyCommandOptions<TArgs>,
    'beforeExecuteHandler' | 'afterExecuteHandler'
>;

/**
 * @deprecated import `CommandAsyncHandlerResult` from `@nexplore/practices-ng-commands` instead
 */
export type LegacyCommandAsyncHandlerResult<T> = CommandAsyncHandlerResult<T>;

/**
 * @deprecated import `CommandAsyncHandlerFn` from `@nexplore/practices-ng-commands` instead
 */
export type LegacyCommandAsyncHandlerFn<TArgs, TResult> = (args: TArgs) => LegacyCommandAsyncHandlerResult<TResult>;

/**
 * @deprecated import `CommandAsyncHandlerArg` from `@nexplore/practices-ng-commands` instead
 */
export type LegacyCommandAsyncHandlerArg<TArgs, TResult> =
    | LegacyCommandAsyncHandlerFn<TArgs, TResult>
    | Observable<TResult>;
