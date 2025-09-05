import {
    AbstractCommand,
    CommandAfterExecuteResult,
    CommandAsyncHandlerFn,
    CommandAsyncHandlerResult,
    CommandOptions,
} from '@nexplore/practices-ng-commands';
import { LegacyCommandBase } from './command-base';
import { LegacyCommandAsyncHandlerFn, LegacyCommandOptions } from './command.types';

/**
 * @deprecated Use `CommandInput` from `@nexplore/practices-ng-commands` instead
 */
export type ILegacyCommand<TArgs = void, TResult = unknown> =
    | LegacyCommandBase<TArgs, TResult>
    | LegacyCommandAsyncHandlerFn<TArgs, TResult>;

// TODO: Remove all references to LegacyCommandBase and LegacyCommandOptions, clean up directives
/**
 * @deprecated
 *
 * Use `CommandInput`
 */
export type CombinedCommandInput<TArgs = any, TResult = unknown> =
    | ILegacyCommand<TArgs, TResult>
    | AbstractCommand<TArgs, TResult>
    | CommandAsyncHandlerFn<TArgs, TResult>;

/**
 * @deprecated
 *
 * Use `CommandInput`
 */
export type ILegacyCombinedCommand<TArgs = any, TResult = unknown> =
    | ILegacyCommand<TArgs, TResult>
    | AbstractCommand<TArgs, TResult>
    | ((args: TArgs, abortSignal?: AbortSignal) => CommandAsyncHandlerResult<TResult>);

/**
 * @deprecated
 *
 * Use `CommandOptions`
 */
export type LegacyOrNewCommandOptions<TArgs> = LegacyCommandOptions<TArgs> | CommandOptions<TArgs>;

/**
 * @deprecated import `CommandAfterExecuteResult` from `@nexplore/practices-ng-commands` instead
 */
export type LegacyCommandAfterExecuteResult<TArgs = void | never | undefined> = CommandAfterExecuteResult<TArgs>;
