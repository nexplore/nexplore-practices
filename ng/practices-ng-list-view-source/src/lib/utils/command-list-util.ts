import { Signal, untracked } from '@angular/core';
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { subscriptionEffect } from '@nexplore/practices-ng-signals';
import { combineLatest, from, Observable, startWith, takeUntil } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { ListViewSource } from '../implementation/list-view-source';
import { IListResult, IQueryParamsWithFilter } from '../types';
import { arrayToInMemorySortedListResult, arrayToListResult } from './list-result-util';

export function commandToListResultObservable<TData, TArgs, TFilter = TArgs>(
    abstractCommand: AbstractCommand<TArgs, TData[] | null | undefined>,
    params: IQueryParamsWithFilter<TFilter>,
    options: { sortInMemory: boolean; triggerQueryCommandWithFilter: boolean }
): Observable<IListResult<TData>> {
    if (options.triggerQueryCommandWithFilter) {
        trace('commandToListResultObservable', 'triggering query command with filter', abstractCommand, params);
        return from(
            abstractCommand.triggerAsync(params.filter as unknown as TArgs, {
                whenNotTriggeredBehavior: 'return-last-result',
            }) as Promise<TData[]>
        ).pipe(
            options.sortInMemory
                ? arrayToInMemorySortedListResult<TData, TFilter>(params, { disableFiltering: true })
                : arrayToListResult()
        );
    } else {
        trace('commandToListResultObservable', 'subscribing to command result$', abstractCommand, params);
        const error$ = abstractCommand.error$.pipe(startWith(null));
        const result$ = abstractCommand.result$ as Observable<TData[]>;

        const completed$ = abstractCommand.completed$.pipe(
            tap(() => trace('commandToListResultObservable', 'completed'))
        );
        return combineLatest([error$, result$]).pipe(
            map(([e, r]) => {
                if (e) {
                    trace('commandToListResultObservable', 'error in query command', e);
                    throw e;
                } else {
                    trace('commandToListResultObservable', 'result in query command', r);
                    return r;
                }
            }),
            filter((r) => r instanceof Array),
            take(1),
            startWith(abstractCommand.result),
            options.sortInMemory
                ? arrayToInMemorySortedListResult<TData, TFilter>(params, { disableFiltering: true })
                : arrayToListResult(),
            takeUntil(completed$)
        );
    }
}

export function refreshListViewSourceWhenCommandTriggered(
    viewSource: ListViewSource<any>,
    commandSignal: ValueOrGetter<AbstractCommand<any, any>>,
    isBeingTriggerredByListViewSourceSignal?: Signal<boolean>
) {
    subscriptionEffect(() => {
        const commandValue = unwrapSignalLike(commandSignal);

        if (commandValue) {
            return untracked(() =>
                commandValue.result$.pipe(filter(() => !isBeingTriggerredByListViewSourceSignal?.())).subscribe(() => {
                    viewSource.refresh();
                })
            );
        } else {
            return undefined;
        }
    });
}
