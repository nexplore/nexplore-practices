import { MaybeAsync } from '@angular/router';
import { maybeAsyncToObservable } from '@nexplore/practices-ng-common-util';
import { map } from 'rxjs/operators';
import { TableViewSource } from '../implementation/table-view-source';
import {
    IListResult,
    IQueryParamsWithFilter,
    TableColumnDefinitions,
    TableColumnItem,
    TableViewSourceConfig,
} from '../types';
import { enhanceListViewSource } from '../utils/internal-util';
import { extendWithFilterForm } from './create-table-view-source-with-filter-form';
import { extendWithPersistedParams } from './create-table-view-source-with-persisted-params';
import { TableViewSourceWithSignals } from './types';

export const extensions = {
    withFilterForm: extendWithFilterForm,
    withPersistedParams: extendWithPersistedParams,
};

export type Extensions = typeof extensions;

export type WithUsedExtensions<
    TTableViewSource extends TableViewSource<any, any> & Partial<Extensions>,
    TExtensionKey extends string | number | symbol = keyof TTableViewSource
> = Omit<TTableViewSource, TExtensionKey>;

export type ExtractFilterTypeFrom<TTableViewSource> = TTableViewSource extends TableViewSource<any, infer TFilter>
    ? TFilter
    : never;

export type ExtractDataTypeFrom<TTableViewSource> = TTableViewSource extends TableViewSource<infer TData, any>
    ? TData
    : never;

export type ExtractResultTypeFrom<TTableViewSource> = TTableViewSource extends TableViewSource<infer TData, any>
    ? IListResult<TData>
    : never;

export function createExtendableTableViewSource<TData, TFilter>(
    config: Omit<TableViewSourceConfig<TData>, 'columns'> & {
        columns?: Array<keyof TData> | Array<TableColumnItem<TData>> | TableColumnDefinitions<Partial<TData>>;
    },
    loadFn: (params: IQueryParamsWithFilter<TFilter>) => MaybeAsync<Partial<IListResult<TData>>>,
    defaults: Partial<IQueryParamsWithFilter<TFilter>> = {}
): TableViewSourceWithSignals<TData, TFilter> & Extensions {
    const tableViewSource = new TableViewSource<TData, TFilter>(
        config,
        (params) =>
            maybeAsyncToObservable(loadFn(params)).pipe(
                map(
                    (result) =>
                        (result?.data
                            ? result
                            : {
                                  data: [],
                                  total: result?.total ?? 0,
                              }) as IListResult<TData>
                )
            ),
        defaults
    );

    Object.entries(extensions).forEach(([key, extension]) => {
        (tableViewSource as any)[key] = extension.bind(tableViewSource);
    });

    return enhanceListViewSource(tableViewSource) as any;
}

