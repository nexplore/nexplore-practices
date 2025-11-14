import { MaybeAsync } from '@angular/router';
import { IListResult, IQueryParamsWithFilter } from '../types';
import { createTypedFactory } from './create-table-view-source';
import { createTypedWithFilterFormFactory } from './create-table-view-source-with-filter-form';
import { createdTypedWithPersistedParamsFactory } from './create-table-view-source-with-persisted-params';
import { Data } from './types';

type LoadFn<TFilter, TResult> = (params: IQueryParamsWithFilter<TFilter>) => MaybeAsync<TResult>;

export function createTableViewSourceWithDataFrom<TResult extends IListResult<any>, TFilter = unknown>(
    loadFn: LoadFn<TFilter, TResult>
): TypedTableViewSourceFactoryFluentApi<Data<TResult>> {
    return createTableViewSourceFactoryFluentApi<Data<TResult>>({ loadFn });
}

type PartialConfig<TData> = {
    loadFn: LoadFn<any, Partial<IListResult<TData>>>;
};

type TypedTableViewSourceFactoryFluentApi<TData> = {
    withConfig: ReturnType<typeof createTypedFactory<TData, PartialConfig<TData>>>;
    withFilterForm: ReturnType<typeof createTypedWithFilterFormFactory<TData, PartialConfig<TData>>>;
    withPersistedParams: ReturnType<typeof createdTypedWithPersistedParamsFactory<TData, PartialConfig<TData>>>;
};

function createTableViewSourceFactoryFluentApi<TData>(
    partialConfig: PartialConfig<TData>
): TypedTableViewSourceFactoryFluentApi<TData> {
    return {
        withConfig: createTypedFactory<TData, PartialConfig<TData>>(partialConfig),
        withFilterForm: createTypedWithFilterFormFactory<TData, PartialConfig<TData>>(partialConfig),
        withPersistedParams: createdTypedWithPersistedParamsFactory<TData, PartialConfig<TData>>(partialConfig),
    };
}

