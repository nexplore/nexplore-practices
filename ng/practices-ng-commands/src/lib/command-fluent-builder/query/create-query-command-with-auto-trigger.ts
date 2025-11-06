import { effect, untracked } from '@angular/core';
import { CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * Creates a query command that triggers automatically.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * If triggered while already running, the command will NOT be re-triggered.
 *
 * Use this when you only need to load data initially. Although you can trigger it manually, it is recommended to use other query commands, that for example trigger based on a signal value.
 *
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithAutoTrigger<TResult>(
    handler: CommandAsyncHandlerArg<void, TResult>,
    options?: QueryOptions<void>
): QueryCommand<void, TResult> {
    const command = createQueryCommand(handler, options, {
        isCancellable: true,
        concurrentTriggerBehavior: { type: 'ignore' },
        status: {
            statusCategory: 'query',
        },
    });

    effect(() => {
        untracked(() => {
            command.trigger();
        });
    });

    return command;
}
