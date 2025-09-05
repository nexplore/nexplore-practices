import { assertInInjectionContext, inject, Injector } from '@angular/core';
import { deepMerge } from '@nexplore/practices-ng-common-util';
import { CommandImpl } from './command-impl';
import { CommandWithLifecycleOptions, CommandWithSignalsAndStatus } from './command-internal.types';
import { enhanceCommandWithStatus } from './command-status-util';
import { CommandAsyncHandlerArg } from './command.types';

export function createCommandWithSignalsAndStatus<TArgs = void, TResult = void>(
    handler: CommandAsyncHandlerArg<TArgs, TResult>,
    options?: CommandWithLifecycleOptions<TArgs>,
    defaultOptions?: CommandWithLifecycleOptions<TArgs>
): CommandWithSignalsAndStatus<TArgs, TResult> {
    assertInInjectionContext(createCommandWithSignalsAndStatus);

    if (options?.waitForRunning) {
        options.concurrentTriggerBehavior = { ...options.concurrentTriggerBehavior, type: 'waitForRunning' };
    }

    options = deepMerge(defaultOptions, options);

    const injector = inject(Injector);
    const command = new CommandImpl<TArgs, TResult>(injector, handler, options);

    enhanceCommandWithStatus(command, options?.status ?? {});

    return command;
}
