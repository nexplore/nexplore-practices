import { inject, Injector, runInInjectionContext } from '@angular/core';
import { deepMerge } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { runWithoutStatus, StatusHubService } from '@nexplore/practices-ng-status';
import { AbstractCommand } from '../commands/abstract-command';
import { CommandImpl } from '../commands/command-impl';
import { ILegacyCommand } from '../commands/command-internal.types';
import { Command, CommandInput, CommandOptions } from '../commands/command.types';
import { createCommandWithSignalsAndStatus } from '../commands/create-command-with-signals-and-status-util';
import { triggerLegacyCommandAsync } from '../commands/legacy-command-util';

/**
 * Returns a command from the provided input, which can be a command, a function, or an observable.
 * - If the input is a command, it will be returned as is, unless options are provided.
 * - If the input is a function, it will be wrapped in a command.
 * - If the input inherits AbstractCommand, it will be wrapped in a command.
 * - If `options` are provided, the command will be wrapped with the provided options.
 * - if `mapArguments` is provided, the input will be wrapped in a command that maps the arguments before calling the input.
 *
 * @param commandInput
 * @param options
 */
export function createCommandFromInput<TInnerArgs, TResult, TArgs = TInnerArgs>(
    commandInput: CommandInput<TInnerArgs, TResult>,
    options?:
        | CommandOptions<TArgs> & {
              mapArguments?: (args: TArgs) => TInnerArgs;
          }
): Command<TArgs, TResult> {
    const mergedOptions = deepMerge({ isCancellable: true, status: options?.status ?? { silent: true } }, options);

    trace('Command', 'Creating command from input', { commandInput, options, mergedOptions });

    if (options?.mapArguments) {
        return createCommandWithSignalsAndStatus((args: TArgs, abort: AbortSignal) => {
            if (commandInput instanceof AbstractCommand) {
                return commandInput.triggerAsync(options.mapArguments!(args), { abortSignal: abort });
            } else if (typeof commandInput === 'function') {
                return commandInput(options.mapArguments!(args), abort);
            } else {
                throw new Error('Cannot map arguments for the provided input');
            }
        }, mergedOptions) as any;
    } else if (commandInput instanceof CommandImpl && !options) {
        return commandInput;
    } else if (commandInput instanceof AbstractCommand) {
        const injector = commandInput instanceof CommandImpl ? commandInput.injector : inject(Injector);
        return runInInjectionContext(injector, () => {
            const statusHub = inject(StatusHubService);
            return createCommandWithSignalsAndStatus(
                (args: TArgs, abort: AbortSignal) =>
                    runWithoutStatus(() => commandInput.triggerAsync(args as any, { abortSignal: abort }), statusHub),
                deepMerge(
                    { status: (commandInput.options as unknown as CommandOptions<TArgs>)?.status },
                    mergedOptions
                ) as any
            ) as any;
        });
    } else if ('trigger' in commandInput && 'error$' in commandInput && 'result$' in commandInput) {
        // Check if the command is a legacy command (TODO: This is temporary, until all commands are migrated)
        const legacyCommand = commandInput as unknown as ILegacyCommand<TArgs, TResult>;

        const statusHub = inject(StatusHubService);

        trace('Command', 'Creating command from legacy command');

        return createCommandWithSignalsAndStatus(
            (args: TArgs, abort: AbortSignal) =>
                runWithoutStatus(() => {
                    return triggerLegacyCommandAsync(legacyCommand, args as any, abort);
                }, statusHub),
            deepMerge({ status: legacyCommand.options }, mergedOptions) as any
        ) as any;
    } else {
        return createCommandWithSignalsAndStatus(commandInput, mergedOptions as any) as any;
    }
}
