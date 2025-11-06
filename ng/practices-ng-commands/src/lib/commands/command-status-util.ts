import { inject } from '@angular/core';
import { deepMerge, enhance } from '@nexplore/practices-ng-common-util';
import { StatusEvent, StatusHubService, StatusProgressOptions } from '@nexplore/practices-ng-status';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { finalize, first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { AbstractCommand } from './abstract-command';
import { CommandOptions } from './command.types';

export type CommandWithStatusSubscription<TArgs, TResult> = AbstractCommand<TArgs, TResult> & {
    /**
     * @internal
     *
     * Holds the currently active subscription to the status service
     *
     * This will automaticly unsubscribe when the command is completed and resubscribe when the command is triggered again
     *
     * This should not be used directly, but is exposed for testing purposes
     */
    _currentlyActiveStatusSubscription?: Subscription;
};

/**
 * Enhances the provided command with status tracking.
 *
 * @param command The command to register
 * @param statusOptions The options to use for the status tracking
 * @param statusHub The status hub service to register the command with. If not provided, the service will be injected.
 * @returns The same command instance
 */
export function enhanceCommandWithStatus<TArgs, TResult>(
    command: AbstractCommand<TArgs, TResult>,
    statusOptions: StatusProgressOptions,
    statusHub?: StatusHubService
): CommandWithStatusSubscription<TArgs, TResult> {
    statusHub = statusHub ?? inject(StatusHubService);

    const commandWithStatus = enhance(command, {
        _currentlyActiveStatusSubscription: {
            writable: true,
            value: new Subscription(),
        },
    });

    command.addOnBeforeExecuteHandler(() => {
        commandWithStatus._currentlyActiveStatusSubscription = registerCommandOneTime(
            commandWithStatus,
            statusOptions,
            statusHub
        ).subscribe();
    });

    command.addOnAfterExecuteHandler(() => {
        if (commandWithStatus._currentlyActiveStatusSubscription) {
            commandWithStatus._currentlyActiveStatusSubscription.unsubscribe();
        }
    });

    return commandWithStatus;
}

/**
 * Subscribes to the command and registers it with the status hub service
 *
 * @param command The command to subscribe to
 * @param statusOptions The options to use for the status tracking
 * @param statusHub The status hub service to register the command with. If not provided, the service will be injected.
 * @returns A subscription to the status service
 */
export function registerCommandStatusSubscription<TArgs, TResult>(
    command: AbstractCommand<TArgs, TResult>,
    statusOptions: StatusProgressOptions,
    statusHub?: StatusHubService
): Subscription {
    statusHub = statusHub ?? inject(StatusHubService);
    return command.triggered$
        .pipe(
            switchMap(() => {
                return registerCommandOneTime<TArgs, TResult>(command, statusOptions, statusHub);
            })
        )
        .subscribe();
}

function registerCommandOneTime<TArgs, TResult>(
    command: AbstractCommand<TArgs, TResult, CommandOptions<TArgs>>,
    statusOptions: StatusProgressOptions,
    statusHub: StatusHubService
) {
    const statusObservable = combineLatest([
        command.error$.pipe(startWith(command.error), takeUntil(command.completed$)),
        command.result$.pipe(startWith(command.result), takeUntil(command.completed$)),
        command.completed$.pipe(
            first(),
            map((_) => true),
            startWith(false)
        ),
        command.busy$.pipe(takeUntil(command.completed$)),
    ]).pipe(
        map(([error, result, hasCompleted, busy]) => ({
            busy,
            error,
            success: hasCompleted && !error ? true : undefined,
            result,
        }))
    ) as Observable<StatusEvent>;

    // TODO: This merge is probably unnecessary?
    const mergedOptions = deepMerge(command.options.status, statusOptions);
    if (!mergedOptions?.statusCategory) {
        mergedOptions.statusCategory = 'action';
    }
    const innerSubscription = statusHub.register(statusObservable, mergedOptions, command);
    return statusObservable.pipe(finalize(() => innerSubscription.unsubscribe()));
}
