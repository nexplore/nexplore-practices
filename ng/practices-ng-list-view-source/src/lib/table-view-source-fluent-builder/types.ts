import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MaybeAsync } from '@angular/router';
import { FormGroupValues, TypedPartialFormGroup, TypedPartialFormGroupValues } from '@nexplore/practices-ng-forms';
import { TableViewSource } from '../implementation/table-view-source';
import {
    EnhancedListViewSource,
    IListResult,
    IQueryParamsWithFilter,
    TableColumnDefinitions,
    TableColumnItem,
    TableViewSourceConfig,
} from '../types';
import { HasTypedQueryParams } from '../types-internal';

export type Data<TResult extends Partial<IListResult<any>>> = TResult extends IListResult<infer T> ? T : never;

export type TypedTableViewSourceFilter<
    TForm,
    TResult extends Partial<IListResult<any>>
> = TForm extends TypedPartialFormGroup<Data<TResult>>
    ? TypedPartialFormGroupValues<TForm, Data<TResult>>
    : TForm extends FormGroup
    ? FormGroupValues<TForm>
    : any;

type TypedTableViewSourceConfigCore<TData, TResult extends Partial<IListResult<TData>>, TFilter, TOrdering> = Omit<
    TableViewSourceConfig<TData>,
    'columns'
> & {
    /** Type is used solely for type inference. Unfortunately, typescript cannot properly infer the type without it */
    type?: Type<TData> | 'no-infer';

    /** Type is used solely for type inference of the orderings. Unfortunately, typescript cannot properly infer the type without it */
    orderingType?: Type<TOrdering> | 'no-infer';

    /**
     * The column configuration for the table.
     */
    columns: NoInfer<Array<keyof TData> | Array<TableColumnItem<TData>> | TableColumnDefinitions<Partial<TData>>>;

    /**
     * The function to load the data.
     */
    loadFn: (params: IQueryParamsWithFilter<TFilter>) => MaybeAsync<TResult>;
};

export type TypedTableViewSourceConfig<
    TData,
    TResult extends Partial<IListResult<TData>>,
    TFilter,
    TOrdering
> = TypedTableViewSourceConfigCore<TData, TResult, TFilter, TOrdering> & HasTypedQueryParams<TFilter, TOrdering>;

export type TypedTableViewSourceConfigPartial<
    TData,
    TResult extends Partial<IListResult<TData>>,
    TFilter,
    TOrdering,
    TOmit extends Record<string, any> | {}
> = Omit<TypedTableViewSourceConfigCore<TData, TResult, TFilter, TOrdering>, keyof TOmit> &
    HasTypedQueryParams<TFilter, TOrdering>;

export type TypedTableViewSourceConfigWithoutLoadFn<
    TData,
    TResult extends IListResult<TData>,
    TFilter,
    TOrdering
> = Omit<TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>, 'loadFn'> & {
    /** Type is used solely for type inference. Unfortunately, typescript cannot properly infer the type without it */
    type?: Type<TData> | 'no-infer';

    /** Type is used solely for type inference of the orderings. Unfortunately, typescript cannot properly infer the type without it */
    orderingType?: Type<TOrdering> | 'no-infer';

    /**
     * The column configuration for the table.
     */
    columns: NoInfer<Array<keyof TData> | Array<TableColumnItem<TData>> | TableColumnDefinitions<Partial<TData>>>;
} & HasTypedQueryParams<TFilter, TOrdering>;

export type TableViewSourceWithSignals<TData, TFilter> = EnhancedListViewSource<TableViewSource<TData, TFilter>>;

