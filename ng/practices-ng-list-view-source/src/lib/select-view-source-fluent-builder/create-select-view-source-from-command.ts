import { untracked } from '@angular/core';
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import { subscriptionEffect } from '@nexplore/practices-ng-signals';
import { asyncScheduler, concat, defer, from, merge, Observable, of, Subject } from 'rxjs';
import { finalize, observeOn, switchMap, take, tap } from 'rxjs/operators';
import { IListResult, IQueryParamsWithFilter } from '../types';
import { commandToListResultObservable } from '../utils/command-list-util';
import { arrayToInMemorySortedListResult, arrayToListResult } from '../utils/list-result-util';
import { createSelectViewSourceInternal } from './extensions';
import {
    SelectViewSourceFilterType,
    SelectViewSourceLabelKey,
    SelectViewSourceWithSignals,
    TypedSelectViewSourceConfig,
} from './types';

type AdditionalConfig = {
    /**
     * If `true`, the data will be sorted in memory.
     *
     * Defaults to `false`.
     */
    sortInMemory?: boolean;

    /**
     * If `true`, the query command will be triggered with the filter of the select view source.
     *
     * Defaults to `true`.
     */
    triggerQueryCommandWithFilter?: boolean;
};

/**
 * Creates a new `SelectViewSource` from a query command.
 *
 * Expects the query command to return an array of items.
 *
 * By default, the select view source triggers the query command itself with its filter whenever it loads.
 * A command created with `command.query.withManualTrigger` is therefore sufficient.
 * If the command is still running, the select view source waits for it to complete before triggering it, unless the command cancels running triggers.
 *
 * When the command produces a result elsewhere (e.g. triggered by `withAutoTrigger`, or set via `withMutableResult`), the select view source shows that result
 * without triggering the command again, as long as no filter is applied (the initial filter, ignoring empty values). Otherwise, it triggers the command again with its filter.
 *
 * @param command The query command to use.
 * @param config The configuration for the SelectViewSource.
 * - `sortInMemory`: Optional flag to sort the data in memory. Default is `false`.
 * - `triggerQueryCommandWithFilter`: Optional flag to trigger the query command with the filter. Default is `true`. If `false` the `QueryCommand` will never be triggered by the `SelectViewSource`.
 */
export function createSelectViewSourceFromCommand<
    TData,
    TArgs,
    TLabelKey extends SelectViewSourceLabelKey<TData> = SelectViewSourceLabelKey<TData>,
    TQueryParams = TData,
    TFilter extends SelectViewSourceFilterType<TData, TLabelKey> = SelectViewSourceFilterType<TData, TLabelKey>
>(
    command: ValueOrGetter<AbstractCommand<TArgs, TData[] | null | undefined>>,
    config?: AdditionalConfig & Omit<TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>, 'loadFn'>
): SelectViewSourceWithSignals<TData, TFilter> {
    const options = { sortInMemory: false, triggerQueryCommandWithFilter: true, ...config };

    const noKnownResult = Symbol('noKnownResult');

    let isTriggeringCommand = false;
    let isCommandRunOwn = false;
    let hasCommandRunResult = false;
    let lastKnownResult: TData[] | null | undefined | typeof noKnownResult;
    let hasExternalResult = false;
    let waitingLoadCount = 0;
    const externalResultWhileWaiting$ = new Subject<void>();

    const toListResult = (
        result$: Observable<TData[] | null | undefined>,
        params: IQueryParamsWithFilter<TFilter>
    ): Observable<IListResult<TData>> =>
        result$.pipe(
            options.sortInMemory
                ? arrayToInMemorySortedListResult<TData, TFilter>(params, { disableFiltering: true })
                : arrayToListResult()
        );

    const load = (params: IQueryParamsWithFilter<TFilter>): Observable<IListResult<TData>> => {
        const cmd = unwrapSignalLike(command);

        if (!options.triggerQueryCommandWithFilter) {
            return commandToListResultObservable(cmd, params, options);
        }

        // The arguments of an external result are unknown, so it only replaces the unfiltered data.
        if (hasExternalResult && isSameFilter(params.filter, initialFilter)) {
            hasExternalResult = false;
            return toListResult(of(cmd.result), params);
        }

        // Triggering a running command would either be ignored or start later, when it is no longer recognizable as triggered by this select view source.
        // Only a running own trigger is cancelled right away, if the command cancels running triggers.
        if (cmd.busy && !(isCommandRunOwn && cancelsRunningOnTrigger(cmd))) {
            let isWaiting = true;
            const stopWaiting = () => {
                if (isWaiting) {
                    isWaiting = false;
                    waitingLoadCount--;
                }
            };

            waitingLoadCount++;
            const waitForCommand$ = merge(cmd.completed$, externalResultWhileWaiting$).pipe(
                take(1),
                // Decide in a new macrotask, so triggers queued by `waitForRunning` start first.
                observeOn(asyncScheduler),
                tap(stopWaiting),
                switchMap(() => load(params)),
                finalize(stopWaiting)
            );

            // An external run may never complete (e.g. a store selection), so its latest result is shown in the meantime.
            return !isCommandRunOwn && hasCommandRunResult
                ? concat(toListResult(of(cmd.result), params), waitForCommand$)
                : waitForCommand$;
        }

        hasExternalResult = false;
        isTriggeringCommand = true;
        try {
            const result = cmd.triggerAsync(params.filter as unknown as TArgs, {
                whenNotTriggeredBehavior: 'return-last-result',
            });
            // Recorded on the promise, because a newer load can unsubscribe this one before it settles.
            result.then(
                (r) => (lastKnownResult = r),
                () => undefined
            );
            return toListResult(from(result), params);
        } finally {
            isTriggeringCommand = false;
        }
    };

    const selectViewSource = createSelectViewSourceInternal<TData, TLabelKey, TQueryParams, TFilter>({
        ...config,
        loadFn: (params: IQueryParamsWithFilter<TFilter>) => defer(() => load(params)),
    } as TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>);

    const initialFilter = selectViewSource.getQueryParams()?.filter;

    subscriptionEffect(() => {
        const cmd = unwrapSignalLike(command);

        if (!cmd) {
            return undefined;
        }

        return untracked(() => {
            // A result that exists already was produced elsewhere, e.g. by `withAutoTrigger` with a synchronous handler.
            isCommandRunOwn = false;
            lastKnownResult = cmd.result;
            hasExternalResult = cmd.result !== undefined;
            hasCommandRunResult = cmd.result !== undefined;

            const subscription = cmd.triggered$.subscribe(() => {
                isCommandRunOwn = isTriggeringCommand;
                hasCommandRunResult = false;
                if (!isCommandRunOwn) {
                    // An external run may return the same array again, changed in place.
                    lastKnownResult = noKnownResult;
                }
            });
            subscription.add(
                cmd.result$.subscribe((result) => {
                    // `withMutableResult` re-emits every result asynchronously, including the ones already known.
                    if (result === lastKnownResult) {
                        return;
                    }

                    lastKnownResult = result;
                    hasCommandRunResult = true;
                    if (isCommandRunOwn && cmd.busy) {
                        return;
                    }

                    hasExternalResult = true;
                    // A waiting load decides on its own, so a refresh would load twice.
                    if (waitingLoadCount > 0) {
                        externalResultWhileWaiting$.next();
                    } else {
                        selectViewSource.refresh();
                    }
                })
            );
            return subscription;
        });
    });

    return selectViewSource;
}

function cancelsRunningOnTrigger<TArgs, TResult>(command: AbstractCommand<TArgs, TResult>) {
    return command.options?.concurrentTriggerBehavior?.type === 'cancelRunning';
}

/**
 * Compares two filters shallowly, treating empty values (`undefined`, `null`, `''`) as not set.
 */
function isSameFilter(a: unknown, b: unknown): boolean {
    if (a === b) {
        return true;
    }

    const valuesOfA = getSetFilterValues(a);
    const valuesOfB = getSetFilterValues(b);
    return (
        !!valuesOfA &&
        !!valuesOfB &&
        valuesOfA.size === valuesOfB.size &&
        [...valuesOfA].every(([key, value]) => valuesOfB.has(key) && valuesOfB.get(key) === value)
    );
}

function getSetFilterValues(filter: unknown): Map<string, unknown> | undefined {
    if (filter === null || typeof filter !== 'object') {
        return undefined;
    }

    return new Map(Object.entries(filter).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}
