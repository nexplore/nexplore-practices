import { computed, inject, Injector, runInInjectionContext, Signal } from '@angular/core';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import { Command, CommandInput, CommandOptions } from '../commands/command.types';
import { createCommandFromInput } from './create-command-from-input';

/**
 * Returns a signal of a command from the provided input signal, whose value can be a command, a function, or an observable.
 * - If the input is a command, it will be returned as is, unless options are provided.
 * - If the input is a function, it will be wrapped in a command.
 * - If the input inherits AbstractCommand, it will be wrapped in a command.
 * - If `options` are provided, the command will be wrapped with the provided options.
 * - if `mapArguments` is provided, the input will be wrapped in a command that maps the arguments before calling the input.
 *
 * @param commandInputSignal The signalor value that provides the command input.
 * @param optionsSignal The signal or value that provides the command options.
 * @returns The signal of the command.
 */
export function createCommandFromInputSignal<TInnerArgs, TResult, TArgs = TInnerArgs>(
    commandInputSignal: ValueOrGetter<null | undefined | CommandInput<TInnerArgs, TResult>>,
    optionsSignal?: ValueOrGetter<
        | null
        | undefined
        | (CommandOptions<TArgs> & {
              mapArguments?: (args: TArgs) => TInnerArgs;
          })
    >
): Signal<Command<TArgs, TResult> | null> {
    const injector = inject(Injector);
    return computed(() => {
        const commandInput = unwrapSignalLike(commandInputSignal);
        const options = unwrapSignalLike(optionsSignal);

        return runInInjectionContext(injector, () =>
            commandInput ? createCommandFromInput(commandInput, options ?? undefined) : null
        );
    });
}
