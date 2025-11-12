import { Type } from '@angular/core';
import { MaybeAsync } from '@angular/router';
import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { SelectViewSource, SelectViewSourceConfig } from '../implementation/select-view-source';
import { EnhancedListViewSource, IListResult, IQueryParamsWithFilter } from '../types';
import { HasTypedQueryParams } from '../types-internal';

export type TypedSelectViewSourceConfig<
    TData,
    TLabelKey extends NoInfer<StringKeyOf<TData>>,
    TQueryParams = TData,
    TOrdering = Pick<TData, TLabelKey>
> = SelectViewSourceConfig<TData> & {
    /** Type is used solely for type inference. Unfortunately, typescript cannot properly infer the type without it */
    type?: Type<TData>;

    /** The query params type is used to infer the type that is used by the query params sent to the server.
     *
     * This affects the available keys for the `orderBy` property.
     *
     * In some cases, it is a completely different type from the result type.
     * */
    queryParamsType?: Type<TQueryParams>;

    loadFn: (params: IQueryParamsWithFilter<Pick<TData, TLabelKey>>) => MaybeAsync<Partial<IListResult<TData>>>;
} & HasTypedQueryParams<TQueryParams, TOrdering>;

export type SelectViewSourceWithSignals<TData, TFilter> = EnhancedListViewSource<SelectViewSource<TData, TFilter>>;
