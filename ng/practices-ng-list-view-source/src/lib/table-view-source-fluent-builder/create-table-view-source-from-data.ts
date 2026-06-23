import { effect, isSignal, untracked } from '@angular/core';
import { MaybeAsync } from '@angular/router';
import { ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { of } from 'rxjs';
import { TableViewSource } from '../implementation/table-view-source';
import { IListResult, IQueryParamsWithFilter } from '../types';
import { createTypedFactory } from './create-table-view-source';
import { createTypedWithFilterFormFactory } from './create-table-view-source-with-filter-form';
import { createdTypedWithPersistedParamsFactory } from './create-table-view-source-with-persisted-params';
import { Data } from './types';

type LoadFn<TFilter, TResult> = (params: IQueryParamsWithFilter<TFilter>) => MaybeAsync<TResult>;

/**
 * Creates a TableViewSource from a function, static data, or a signal of data.
 *
 * - If a function is provided, it will be used to load the data (Can be either sync or async, returning a promise or observable).
 * - If a signal is provided, the TableViewSource will refresh automatically when the signal changes.
 * - If static data is provided, it will be used as the data source.
 * - You can either pass a result object or an array of data items.
 *
 * @param loadFn The data to use, either as a static value, a signal, or a function returning the data.
 * @returns A fluent API to further configure the TableViewSource.
 */
export function createTableViewSourceFromData<TResult extends IListResult<any>, TFilter = unknown>(
    loadFn: LoadFn<TFilter, TResult> | ValueOrSignal<TResult | Data<TResult>>
): TypedTableViewSourceFactoryFluentApi<Data<TResult>> {
    let additionalBehavior: ((source: TableViewSource<Data<TResult>, TFilter>) => void) | undefined = undefined;

    if (isSignal(loadFn)) {
        const dataSignal = loadFn;
        loadFn = (_) => {
            const dataOrResult = untracked(() => dataSignal());
            return of(
                Array.isArray(dataOrResult)
                    ? ({ data: dataOrResult, total: dataOrResult.length } as unknown as TResult)
                    : dataOrResult
            );
        };

        // Refresh the TableViewSource whenever the signal changes
        additionalBehavior = (source) => {
            effect(() => {
                const data = dataSignal();
                if (data) {
                    untracked(() => source.refresh());
                }
            });
        };
    } else if (typeof loadFn !== 'function') {
        const result = Array.isArray(loadFn) ? ({ data: loadFn, total: loadFn.length } as unknown as TResult) : loadFn;
        loadFn = (_) => of(result);
    }

    return createTableViewSourceFactoryFluentApi<Data<TResult>>({ loadFn }, additionalBehavior);
}

type PartialConfig<TData> = {
    loadFn: LoadFn<any, Partial<IListResult<TData>>>;
};

type TypedTableViewSourceFactoryFluentApi<TData> = {
    withConfig: ReturnType<typeof createTypedFactory<TData, PartialConfig<TData>>>;
    withFilterForm: ReturnType<typeof createTypedWithFilterFormFactory<TData, PartialConfig<TData>>>;
    withPersistedParams: ReturnType<typeof createdTypedWithPersistedParamsFactory<TData, PartialConfig<TData>>>;
};

function wrapWithBehavior<TSource extends (...args: any) => any>(
    source: TSource,
    behavior: undefined | ((source: ReturnType<TSource>) => void)
): TSource {
    if (!behavior) {
        return source;
    }

    return ((...args: any[]) => {
        const result = source(...args);
        behavior(result);
        return result;
    }) as TSource;
}

function createTableViewSourceFactoryFluentApi<TData>(
    partialConfig: PartialConfig<TData>,
    behavior?: (source: TableViewSource<TData, any>) => void
): TypedTableViewSourceFactoryFluentApi<TData> {
    return {
        withConfig: wrapWithBehavior(createTypedFactory<TData, PartialConfig<TData>>(partialConfig), behavior),
        withFilterForm: wrapWithBehavior(
            createTypedWithFilterFormFactory<TData, PartialConfig<TData>>(partialConfig),
            behavior
        ),
        withPersistedParams: wrapWithBehavior(
            createdTypedWithPersistedParamsFactory<TData, PartialConfig<TData>>(partialConfig),
            behavior
        ),
    };
}

