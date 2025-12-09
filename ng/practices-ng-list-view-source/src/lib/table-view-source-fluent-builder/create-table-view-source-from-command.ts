import { signal, untracked } from '@angular/core';
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import { unwrapSignalLike, ValueOrGetter, ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { TypedFormGroup } from '@nexplore/practices-ng-forms';
import { tap } from 'rxjs/operators';
import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { commandToListResultObservable, refreshListViewSourceWhenCommandTriggered } from '../utils/command-list-util';
import { getDefaultQueryParams } from '../utils/internal-util';
import { PersistParamsConfig } from './create-table-view-source-with-persisted-params';
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

export function createTableViewSourceFromCommand<TData, TArgs, TFilter = TArgs, TOrdering = TData>(
    command: ValueOrGetter<AbstractCommand<TArgs, TData[] | null | undefined>>,
    config: AdditionalConfig & TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions;

export function createTableViewSourceFromCommand<TData, TArgs>(
    command: ValueOrGetter<AbstractCommand<TArgs, TData[] | null | undefined>>
): TypedTableViewSourceFactoryFluentApi<TData, TArgs>;

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
    config?: AdditionalConfig & TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering>
): (TableViewSourceWithSignals<TData, TFilter> & Extensions) | TypedTableViewSourceFactoryFluentApi<TData, TArgs> {
    if (!config) {
        return createTableViewSourceFactoryFluentApi<TData, TArgs>(command);
    }

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

function createTableViewSourceFactoryFluentApi<TData, TArgs>(
    command: ValueOrGetter<AbstractCommand<TArgs, TData[] | null | undefined>>
) {
    return {
        withConfig<TFilter = TArgs, TOrdering = TData>(
            config: AdditionalConfig &
                TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering>
        ) {
            return createTableViewSourceFromCommand(command, config);
        },
        withFilterForm<TFilter = TArgs, TOrdering = TData>(
            config: AdditionalConfig &
                TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering> &
                (
                    | {
                          filterForm: ValueOrSignal<TypedFormGroup<TFilter>>;
                      }
                    | ValueOrSignal<TypedFormGroup<TFilter>>
                )
        ) {
            return createTableViewSourceFromCommand(command, config).withFilterForm(config as any);
        },
        withPersistedParams<TFilter = TArgs, TOrdering = TData>(
            config: AdditionalConfig &
                TypedTableViewSourceConfigWithoutLoadFn<TData, IListResult<TData>, TFilter, TOrdering> &
                PersistParamsConfig<TFilter, TData>
        ) {
            return createTableViewSourceFromCommand(command, config).withPersistedParams(config);
        },
    };
}

type TypedTableViewSourceFactoryFluentApi<TData, TArgs> = ReturnType<
    typeof createTableViewSourceFactoryFluentApi<TData, TArgs>
>;
