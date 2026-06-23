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
     * DEfaults to `true`.
     */
    sortInMemory?: boolean;

    /**
     * If `true`, the query command will be triggered with the filter of the table view source.
     *
     * Defaults to `false`.
     */
    triggerQueryCommandWithFilter?: boolean;
};

/**
 * Creates a new `TableViewSource` from a query command.
 *
 * Expects the query command to return an array of items.
 *
 * Notice: By default does NOT trigger the query command automatically (unless the command was created with `withAutoTrigger`).
 *
 * This can be overridden by setting `config.triggerQueryCommandWithFilter` to `true`.
 *
 * @param command The query command to use.
 * @param config The configuration for the TableViewSource.
 * - `columns`: The columns to display in the table.
 * - `columnTranslationPrefix`: Optional prefix for the column translations.
 * - `transformFieldForOrdering`: Optional function to transform the field name for ordering.
 * - `sortInMemory`: Optional flag to sort the data in memory. Default is `true`.
 * - `triggerQueryCommandWithFilter`: Optional flag to trigger the query command with the filter. Default is `false`. f `false` the `QueryCommand` will never be triggered by the `TableViewSource`.
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
    const selectViewSource = createSelectViewSourceInternal<TData, TLabelKey, TQueryParams, TFilter>({
        ...config,
        loadFn: (params: any) => {
            untracked(() => isBeingTriggerredByListViewSourceSignal.set(true));
            return commandToListResultObservable(unwrapSignalLike(command), params, {
                sortInMemory: false,
                triggerQueryCommandWithFilter: true,
                ...config,
            }).pipe(tap(() => setTimeout(() => isBeingTriggerredByListViewSourceSignal.set(false))));
        },
    } as TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>);

    refreshListViewSourceWhenCommandTriggered(selectViewSource, command, isBeingTriggerredByListViewSourceSignal);

    return selectViewSource;
}
