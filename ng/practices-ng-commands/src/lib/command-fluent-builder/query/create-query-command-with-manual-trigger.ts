import { CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * Creates a query command that triggers manually.
 *
 * NOTE: Normally you should only use this if no other trigger makes sense.
 *
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithManualTrigger<TResult, TArgs = void>(
    handler: CommandAsyncHandlerArg<TArgs, TResult>,
    options?: QueryOptions<TArgs>
): QueryCommand<TArgs, TResult> {
    return createQueryCommand(handler, options, {
        isCancellable: true,
        concurrentTriggerBehavior: { type: 'ignore' },
        status: {
            statusCategory: 'query',
        },
    });
}
