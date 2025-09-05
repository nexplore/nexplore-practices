import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { enhance, firstOrDefaultFromMaybeAsync } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Command, CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createQueryCommand } from './command-query-util';

/**
 * @experimental
 * Creates a query command which is interdependent with the provided source command.
 *
 * - When it is triggered, it will first trigger the source command with the provided arguments and await the result.
 * - After that, it will call the handler with the result of the source command.
 * - Alternatively, when the source command gets triggered by **someone else**, the query command will be triggered with the latest result of the source command.
 *
 * If triggered while already running, the command will be canceled and re-triggered with the new arguments, unless the arguments are the same.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * @param sourceCommand The source command that will be used to trigger the command.
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createQueryCommandWithCommandInterdependency<TSourceResult, TResult, TSourceArgs = void>(
    sourceCommand: Command<TSourceArgs, TSourceResult>,
    handler: CommandAsyncHandlerArg<TSourceResult, TResult>,
    options?: QueryOptions<TSourceArgs>
): QueryCommand<TSourceArgs, TResult> {
    let overrideSourceResultState: { args: TSourceResult } | undefined;
    const innerHandler = (args: TSourceArgs, abortSignal: AbortSignal) => {
        if (overrideSourceResultState) {
            return firstOrDefaultFromMaybeAsync(handler(overrideSourceResultState.args, abortSignal), null).then(
                (result) => {
                    overrideSourceResultState = undefined;
                    return result;
                }
            );
        } else {
            return sourceCommand.triggerAsync(args, { abortSignal }).then((sourceResult) => {
                return firstOrDefaultFromMaybeAsync(handler(sourceResult as TSourceResult, abortSignal), null);
            });
        }
    };
    const queryCommand = createQueryCommand(innerHandler, options, {
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
        if (!overrideSourceResultState && !queryCommand.busy) {
            overrideSourceResultState = { args };
            trace('QueryCommand', 'Triggered by source command', { args, queryCommand, sourceCommand });
            queryCommand.trigger(null as any); // Seems hacky, but we know that the sourceCommand is not triggered with any args
        }
    });

    const queryCommandBusy$ = queryCommand.busy$;
    const sourceCommandBusy$ = sourceCommand.busy$;

    enhance(queryCommand, {
        busy$: combineLatest([queryCommandBusy$, sourceCommandBusy$]).pipe(
            map(([queryBusy, sourceBusy]) => queryBusy || sourceBusy)
        ),
    });

    return queryCommand as QueryCommand<TSourceArgs, TResult>;
}
