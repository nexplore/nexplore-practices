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

type InferredlabelKey<TLabelKey, TData> = TLabelKey extends StringKeyOf<TData> ? TLabelKey : StringKeyOf<TData>;

export type TypedSelectViewSourceConfig<
    TData,
    TLabelKey extends SelectViewSourceLabelKey<TData>,
    TQueryParams = TData,
    TOrdering = TData
> = {
    /**
     * The label property to display in the select.
     *
     * Will **also** be used to infer the type of the queryParams filter object.
     * For example:
     * ```ts
     * selectViewSource.withConfig({
     *   label: 'fullName',
     *   loadFn: (queryParams) => searchByKeywords(queryParams.filter.fullName) // `filter` is type `{ fullName: string }`, where fullName represents the typed keywords.
     * })
     * ```
     *
     * Note: If you don't provide a label, the filter will fall back to a default type: `{ label: string }`
     */
    label?: InferredlabelKey<TLabelKey, TData>;

    /**
     * The value property to bind
     */
    value?: keyof TData;

    /**
     * True when the select should be searchable, false otherwise. Default is true.
     */
    searchable?: boolean;

    /**
     * True when the select should filter interally using a simple text search, false otherwise. Default is false.
     */
    localSearch?: boolean;

    /**
     * Type is used solely for type inference. Unfortunately, typescript cannot properly infer the type without it.
     *
     * It's completely optional and has no runtime-effect.
     *
     * Alternatively, create the select view source using `selectViewSource.withTye<MyItemType>().withConfig(...)
     */
    type?: Type<TData>;

    /**
     * The query params type is used to infer the type that is used by the query params sent to the server.
     *
     * This affects the available keys for the `orderBy` property.
     *
     * In some cases, it is a completely different type from the result type.
     * */
    queryParamsType?: Type<TQueryParams>;

    /**
     * The function that will be called whenever new data is requested.
     *
     * It will be called with the current query params, which includes sorting, paging, and filtering arguments.
     *
     * It should return either a promise, observable or directly a ListResult.
     */
    loadFn: (
        params: IQueryParamsWithFilter<SelectViewSourceFilterType<TData, TLabelKey>>
    ) => MaybeAsync<Partial<IListResult<TData>>>;
} & HasTypedQueryParams<TQueryParams, TOrdering>;

export type SelectViewSourceWithSignals<TData, TFilter> = EnhancedListViewSource<SelectViewSource<TData, TFilter>>;
