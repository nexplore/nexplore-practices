import { ActionCommand, CommandAsyncHandlerArg, CommandOptions } from '../commands/command.types';
import { createCommandWithSignalsAndStatus } from '../commands/create-command-with-signals-and-status-util';

/**
 * Creates an action command that can be triggered with the args of the provided type.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createActionCommand<TArgs = void, TResult = void>(
    handler: CommandAsyncHandlerArg<TArgs, TResult>,
    options?: CommandOptions<TArgs>
): ActionCommand<TArgs, TResult> {
    return createCommandWithSignalsAndStatus(handler, options, {
        concurrentTriggerBehavior: { type: 'ignore' },
        status: {
            statusCategory: 'action',
        },
    });
}
