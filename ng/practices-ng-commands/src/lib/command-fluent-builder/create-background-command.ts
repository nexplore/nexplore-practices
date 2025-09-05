import { ActionCommand, CommandAsyncHandlerArg, CommandOptions } from '../commands/command.types';
import { createCommandWithSignalsAndStatus } from '../commands/create-command-with-signals-and-status-util';

/**
 * Creates an action command that triggers automatically.
 *
 * Does register the status in the `StatusHubService` but does not show any progress indication, except for errors.
 *
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createBackgroundCommand<TResult = void>(
    handler: CommandAsyncHandlerArg<void, TResult>,
    options?: CommandOptions<void>
): ActionCommand<void, TResult> {
    const command = createCommandWithSignalsAndStatus(handler, options, {
        concurrentTriggerBehavior: { type: 'waitForRunning' },
        status: {
            statusCategory: 'none',
            silent: true,
        },
    });

    command.trigger();

    return command;
}
