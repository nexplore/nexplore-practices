import { Type } from '@angular/core';
import { MaybeAsync } from '@angular/router';
import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { SelectViewSource } from '../implementation/select-view-source';
import { EnhancedListViewSource, IListResult, IQueryParamsWithFilter } from '../types';
import { HasTypedQueryParams } from '../types-internal';

export type SelectViewSourceDefaultFilter = { label: string };

/**
 * The default key used by ng-select, when there is not bind-label used
 */
export type SelectViewSourceDefaultLabelKey = keyof SelectViewSourceDefaultFilter;

export type SelectViewSourceLabelKey<TData> = NoInfer<StringKeyOf<TData>> | SelectViewSourceDefaultLabelKey;
export type SelectViewSourceFilterType<TData, TLabelKey> = [TLabelKey] extends [StringKeyOf<TData>]
    ? Pick<TData, TLabelKey>
    : SelectViewSourceDefaultFilter;

export type TypedSelectViewSourceConfig<
    TData,
    TLabelKey extends SelectViewSourceLabelKey<TData>,
    TQueryParams = TData,
    TOrdering = TData
> = (TLabelKey extends StringKeyOf<TData>
    ? {
          // The label property to display in the select
          label?: TLabelKey;
      }
    : {
          // The label property to display in the select
          label?: StringKeyOf<TData>;
      }) & {
    // The value property to bind
    value?: keyof TData;

    // True when the select should be searchable, false otherwise. Default is true.
    searchable?: boolean;

    // True when the select should filter interally using a simple text search, false otherwise. Default is false.
    localSearch?: boolean;

    /** Type is used solely for type inference. Unfortunately, typescript cannot properly infer the type without it */
    type?: Type<TData>;

    /** The query params type is used to infer the type that is used by the query params sent to the server.
     *
     * This affects the available keys for the `orderBy` property.
     *
     * In some cases, it is a completely different type from the result type.
     * */
    queryParamsType?: Type<TQueryParams>;

    loadFn: (
        params: IQueryParamsWithFilter<SelectViewSourceFilterType<TData, TLabelKey>>
    ) => MaybeAsync<Partial<IListResult<TData>>>;
} & HasTypedQueryParams<TQueryParams, TOrdering>;

export type SelectViewSourceWithSignals<TData, TFilter> = EnhancedListViewSource<SelectViewSource<TData, TFilter>>;
