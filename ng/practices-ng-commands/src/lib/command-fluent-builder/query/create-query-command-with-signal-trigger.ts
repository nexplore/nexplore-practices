import { effect, Signal, untracked } from '@angular/core';
import { CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * Creates a query command that triggers whenever the provided signal produces a non-null/undefined value.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * If triggered while already running, the command will be canceled and re-triggered with the new arguments, unless the arguments are the same.
 *
 * @param signal The signal that will be used to trigger the command.
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithSignalTrigger<TArgs, TResult>(
    signal: Signal<TArgs> | (() => TArgs | null | undefined),
    handler: CommandAsyncHandlerArg<TArgs, TResult>,
    options?: QueryOptions<TArgs>
): QueryCommand<TArgs, TResult> {
    const queryCommand = createQueryCommand(handler, options, {
        isCancellable: true,
        concurrentTriggerBehavior: {
            type: 'cancelRunning',
            onlyWhenParamsChanged: true,
        },
        status: {
            statusCategory: 'query',
        },
    });

    effect(() => {
        const args = signal();
        if (args !== undefined && args !== null) {
            untracked(() => queryCommand.trigger(args));
        }
    });

    return queryCommand;
}
