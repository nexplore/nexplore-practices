import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * Creates a query command that triggers whenever the provided observable produces a value.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * If triggered while already running, the command will be canceled and re-triggered with the new arguments, unless the arguments are the same.
 *
 * @param observable The observable that will be used to trigger the command.
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithObservableTrigger<TArgs, TResult>(
    observable: Observable<TArgs>,
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

    observable.pipe(takeUntilDestroyed()).subscribe((args) => {
        queryCommand.trigger(args);
    });

    return queryCommand;
}
