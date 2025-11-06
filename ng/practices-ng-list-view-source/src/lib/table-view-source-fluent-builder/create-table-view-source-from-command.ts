import { signal, untracked } from '@angular/core';
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import { tap } from 'rxjs/operators';
import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { commandToListResultObservable, refreshListViewSourceWhenCommandTriggered } from '../utils/command-list-util';
import { getDefaultQueryParams } from '../utils/internal-util';
import { createExtendableTableViewSource, Extensions } from './extensions';
import { TableViewSourceWithSignals, TypedTableViewSourceConfigWithoutLoadFn } from './types';

type AdditionalConfig = {
    /**
     * If `true`, the data will be sorted in memory.
     *
     * Default is `true`.
     */
    sortInMemory?: boolean;

    /**
     * If `true`, the query command will be triggered with the filter of the table view source.
     *
     * Default is `false`.
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
export function createTableViewSourceFromCommand<TData, TArgs, TFilter = TArgs, TOrdering = TData>(
    command: ValueOrGetter<AbstractCommand<TArgs, TData[] | null | undefined>>,
    config: AdditionalConfig & TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions {
    const isBeingTriggerredByListViewSourceSignal = signal(false);
    const tableViewSource = createExtendableTableViewSource<TData, TFilter>(
        config,
        (params: any) => {
            untracked(() => isBeingTriggerredByListViewSourceSignal.set(true));
            return commandToListResultObservable(unwrapSignalLike(command), params, {
                sortInMemory: true,
                triggerQueryCommandWithFilter: false,
                ...config,
            }).pipe(tap(() => setTimeout(() => isBeingTriggerredByListViewSourceSignal.set(false))));
        },
        getDefaultQueryParams(config as unknown as HasTypedQueryParams<TFilter, TOrdering>)
    );

    refreshListViewSourceWhenCommandTriggered(tableViewSource, command, isBeingTriggerredByListViewSourceSignal);

    return tableViewSource;
}
