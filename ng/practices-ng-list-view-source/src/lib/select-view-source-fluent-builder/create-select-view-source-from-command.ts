import { signal, untracked } from '@angular/core';
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import { tap } from 'rxjs/operators';
import { commandToListResultObservable, refreshListViewSourceWhenCommandTriggered } from '../utils/command-list-util';
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
 *
 * When the command is triggered elsewhere (e.g. by `withAutoTrigger`), the select view source shows that result without triggering the command again.
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
    const isBeingTriggerredByListViewSourceSignal = signal(false);
    const noExternalResult = Symbol('noExternalResult');
    let lastLoadedFilter: unknown;
    let externalResultForFilter: unknown = noExternalResult;

    const selectViewSource = createSelectViewSourceInternal<TData, TLabelKey, TQueryParams, TFilter>({
        ...config,
        loadFn: (params: any) => {
            // A refresh caused by an external trigger shows that result instead of triggering the command again.
            // A filter change in the same debounce window still triggers the command with the new filter.
            const useLatestResult = externalResultForFilter === params.filter;
            externalResultForFilter = noExternalResult;
            lastLoadedFilter = params.filter;

            const options = {
                sortInMemory: false,
                triggerQueryCommandWithFilter: true,
                ...config,
                useLatestResult,
            };

            if (useLatestResult) {
                return commandToListResultObservable(unwrapSignalLike(command), params, options);
            }

            untracked(() => isBeingTriggerredByListViewSourceSignal.set(true));
            return commandToListResultObservable(unwrapSignalLike(command), params, options).pipe(
                tap(() => setTimeout(() => isBeingTriggerredByListViewSourceSignal.set(false)))
            );
        },
    } as TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>);

    lastLoadedFilter = selectViewSource.getQueryParams()?.filter;

    refreshListViewSourceWhenCommandTriggered(
        selectViewSource,
        command,
        isBeingTriggerredByListViewSourceSignal,
        () => {
            externalResultForFilter = lastLoadedFilter;
        }
    );

    return selectViewSource;
}
