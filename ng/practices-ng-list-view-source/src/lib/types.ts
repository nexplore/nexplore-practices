import { Signal, WritableSignal } from '@angular/core';
import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { Observable } from 'rxjs';
import { FilterableListViewSource } from './implementation/list-view-source';

export interface IListResult<T> {
    data: T[];
    total?: number | null;
}

export interface IOrdering {
    field: string;
    direction: OrderDirection;
}

export enum OrderDirection {
    Asc,
    Desc,
}

export interface IQueryParams {
    skip?: number;
    take?: number;
    orderings?: IOrdering[];
    includeTotal?: boolean;
}

export interface IQueryParamsWithFilter<TFilter> extends IQueryParams {
    filter: TFilter;
}

export interface IListViewSource<TData> {
    /**
     * Stream of the busy state
     */
    busy$: Observable<boolean>;

    /**
     * Stream of the errors
     */
    error$: Observable<object>;

    /**
     * Stream of the current list result
     */
    page$: Observable<IListResult<TData> | undefined>;

    /**
     * Stream of the data of the current list result
     */
    pageData$: Observable<TData[] | undefined>;

    /**
     * Stream of the current query parameters
     */
    queryParams$: Observable<IQueryParams | undefined>;

    /**
     * Loads all data without paging and returns it.
     */
    fetchAllData(): Observable<IListResult<TData>>;

    /**
     * Gets the current query parameters
     */
    getQueryParams(): IQueryParams | undefined;

    /**
     * Requests the source with the provided orderings
     */
    sort(orderings: IOrdering[]): void;

    /**
     * Requests the source with the provided paging values
     */
    page(skip: number | undefined, take: number | undefined): void;

    /**
     * Applies prefetched data (i.e. appends the data to the existing table data) and prefetches the next page.
     * If `isLastPrefetch` is true, the prefetched data will directly be applied
     */
    prefetchNextPage(skip: number, take: number, isLastPrefetch?: boolean): Observable<IListResult<TData>>;

    /**
     * Requests the source with the current parameters again
     */
    refresh(): void;

    /**
     * Requests the source with the defined defaults
     */
    reset(): void;

    /**
     * Requests the source with the provided query parameters.
     */
    update(params: Partial<IQueryParams>): void;
}

export interface IFilterableListViewSource<TData, TFilter> extends IListViewSource<TData> {
    /**
     * Stream of the current query parameters
     */
    queryParams$: Observable<IQueryParamsWithFilter<TFilter> | undefined>;

    /**
     * Requests the source with the provided filter
     */
    filter(filter: TFilter): void;

    /**
     * Requests the source with the provided query parameters.
     */
    update(params: Partial<IQueryParamsWithFilter<TFilter>>): void;

    /**
     * Gets the current query parameters
     */
    getQueryParams(): IQueryParamsWithFilter<TFilter> | undefined;
}

export interface TableColumn {
    sortable?: boolean;
    sortDir?: OrderDirection | null;
    columnLabel?: string;
    columnLabelKey?: string;
    columnLabelKeyParams?: any;

    orderingFieldName?: string;
}

export interface TableColumnItem<TData> extends TableColumn {
    fieldName?: keyof TData;
}

export type TableColumnDefinitions<TData> = {
    [field in keyof TData]?: TableColumnItem<TData>;
};

export interface TableViewSourceConfig<TData> {
    columns: TableColumnDefinitions<TData>;
    columnTranslationPrefix?: string;
    transformFieldForOrdering?: (field: string) => string;
}

export type TypedOrdering<T> = IOrdering & {
    field: StringKeyOf<T>;
};

export type TypedQueryParamsWithFilter<TFilter, TData> = IQueryParamsWithFilter<TFilter> & {
    orderings: TypedOrdering<TData>[];
};

type ExtractData<TViewSource> = TViewSource extends IListViewSource<infer TData> ? TData : never;

export type WithMutableDataOptions = {
    /**
     * By default, the mutated data will get sorted (inplace) according to current query params, set to `true` to disable this behavior.
     */
    disableInMemorySorting?: boolean;
};

export type ListViewSourceEnhancements<TViewSource> = {
    busySignal: Signal<boolean>;
    errorSignal: Signal<any>;
    queryParamsSignal: Signal<TypedQueryParamsWithFilter<any, any>>;
    pageDataSignal: Signal<ExtractData<TViewSource>[]>;
    totalCountSignal: Signal<number | null>;

    /**
     * Enhances the list view source by making the `pageDataSignal` and `totalCountSignal` writable.
     *
     * This is useful when needing to manipulate the list in memory.
     */
    withMutableData: (options?: WithMutableDataOptions) => MutableEnhancedListViewSource<TViewSource>;
};

export type EnhancedListViewSource<TViewSource> = TViewSource &
    ListViewSourceEnhancements<TViewSource> &
    (TViewSource extends FilterableListViewSource<any, infer TFilter> ? { filterSignal: Signal<TFilter> } : any);

export type MutableEnhancedListViewSource<TViewSource> = EnhancedListViewSource<TViewSource> & {
    pageDataSignal: WritableSignal<ExtractData<TViewSource>[]>;
    totalCountSignal: WritableSignal<number | null>;
};
