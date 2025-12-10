import { Type } from '@angular/core';
import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { getDefaultQueryParams } from '../utils/internal-util';
import { createTypedFactory } from './create-table-view-source';
import { createTypedWithFilterFormFactory } from './create-table-view-source-with-filter-form';
import { createdTypedWithPersistedParamsFactory } from './create-table-view-source-with-persisted-params';
import { createExtendableTableViewSource, Extensions } from './extensions';
import { TableViewSourceWithSignals, TypedTableViewSourceConfig } from './types';

type AdditionalConfig<TData> = {
    /** Type is used solely for type inference. Unfortunately, sometimes typescript cannot properly infer the type without it */
    type: Type<TData>;
};

/**
 * Creates a TableViewSource that has a type associated with it.
 *
 * This type is either a concrete class or an interface. It is used for type inference and type safety.
 *
 * There are two ways to use this function:
 * - With a config object that contains the type and other properties.
 * - Without a config object, in which case it returns a fluent API for creating a TableViewSource based on the type.
 *
 * Example 1 (Using an interface):
 *
 * ```ts
 * interface AssessmentDto {
 *    referenceNumber: string;
 *    currentStateDisplayName: string;
 *    isIhpAssessment: boolean;
 * }
 *
 * readonly assessmentSource = tableViewSource
 *  .withType<AssessmentDto>() // Pre-defined type
 *  .withConfig({
 *     columns: [
 *         { fieldName: 'referenceNumber', columnLabelKey: 'Labels.AssessmentReferenceNumber' },
 *         { fieldName: 'currentStateDisplayName', columnLabelKey: 'Labels.Status' },
 *         { fieldName: 'isIhpAssessment', columnLabelKey: 'Labels.BusinessType' },
 *         { fieldName: 'createdOn', columnLabelKey: 'Labels.CreatedOn' },
 *     ],
 *     sortBy: 'createdOn',
 *     loadFn: (params) => {
 *         return this._api.getAssessmentListEntries(params.skip, params.take, params.orderings, params.includeTotal);
 *     },
 * });
 * ```
 *
 *
 * Example 2 (Using a concrete class):
 * ```ts
 * class AssessmentDto {
 *    constructor(public referenceNumber: string, public currentStateDisplayName: string, public isIhpAssessment: boolean) {}
 * }
 *
 * readonly assessmentSource = tableViewSource.withType({ // No need to specify the type as a generic type param here, it is inferred from the class `type` parameter
 *     type: AssessmentDto, // The type has to be a class with a constructor.
 *     columns: [
 *         { fieldName: 'referenceNumber', columnLabelKey: 'Labels.AssessmentReferenceNumber' },
 *         { fieldName: 'currentStateDisplayName', columnLabelKey: 'Labels.Status' },
 *         { fieldName: 'isIhpAssessment', columnLabelKey: 'Labels.BusinessType' },
 *         { fieldName: 'createdOn', columnLabelKey: 'Labels.CreatedOn' },
 *     ],
 *     defaultQueryParams: {
 *         orderings: [{ field: 'createdOn', direction: OrderDirection.Desc }],
 *     },
 *     loadFn: (params) => {
 *         return this._api.getAssessmentListEntries(params.skip, params.take, params.orderings, params.includeTotal);
 *     },
 * });
 * ```
 */
export function createTableViewSourceWithType<
    TData,
    TResult extends Partial<IListResult<TData>> = IListResult<TData>,
    TFilter = unknown,
    TOrdering = TData
>(
    config: AdditionalConfig<TData> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions;
export function createTableViewSourceWithType<TData>(): TypedTableViewSourceFactoryFluentApi<TData>;
export function createTableViewSourceWithType<
    TData,
    TResult extends Partial<IListResult<TData>> = IListResult<TData>,
    TFilter = unknown,
    TOrdering = TData
>(
    config?: AdditionalConfig<TData> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
): TypedTableViewSourceFactoryFluentApi<TData> | (TableViewSourceWithSignals<TData, TFilter> & Extensions) {
    if (!config) {
        return createTableViewSourceFactoryFluentApi<TData>();
    }
    return createExtendableTableViewSource<TData, TFilter>(
        config,
        config.loadFn,
        getDefaultQueryParams(config as HasTypedQueryParams<TFilter, TOrdering>)
    );
}

type TypedTableViewSourceFactoryFluentApi<TData> = {
    withFilterForm: ReturnType<typeof createTypedWithFilterFormFactory<TData>>;
    withPersistedParams: ReturnType<typeof createdTypedWithPersistedParamsFactory<TData>>;
    withConfig: ReturnType<typeof createTypedFactory<TData>>;
};

function createTableViewSourceFactoryFluentApi<TData>(): TypedTableViewSourceFactoryFluentApi<TData> {
    return {
        withFilterForm: createTypedWithFilterFormFactory<TData>(),
        withPersistedParams: createdTypedWithPersistedParamsFactory<TData>(),
        withConfig: createTypedFactory<TData>(),
    };
}
