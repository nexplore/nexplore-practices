import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { enhance } from '@nexplore/practices-ng-common-util';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Command, CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * @experimental
 * Creates a query command that triggers whenever the provided source command produces a result.
 *
 * Also forwards the busy state of the source command.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * If triggered while already running, the command will be canceled and re-triggered with the new arguments, unless the arguments are the same.
 *
 * @param sourceCommand The source command that will be used to trigger the command.
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithCommandSourceDependency<TArgs, TResult, TSourceArgs = any>(
    sourceCommand: Command<TSourceArgs, TArgs>,
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

    sourceCommand.result$.pipe(takeUntilDestroyed()).subscribe((args) => {
        queryCommand.trigger(args);
    });

    const queryCommandBusy$ = queryCommand.busy$;
    const sourceCommandBusy$ = sourceCommand.busy$;

    enhance(queryCommand, {
        busy$: combineLatest([queryCommandBusy$, sourceCommandBusy$]).pipe(
            map(([queryBusy, sourceBusy]) => queryBusy || sourceBusy)
        ),
    });

    return queryCommand;
}
