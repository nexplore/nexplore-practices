import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { getDefaultQueryParams } from '../utils/internal-util';
import { createExtendableTableViewSource, Extensions } from './extensions';
import { TableViewSourceWithSignals, TypedTableViewSourceConfig, TypedTableViewSourceConfigPartial } from './types';

/**
 * Creates a TableViewSource with the specified configuration
 *
 * readonly assessmentSource = tableViewSource.withConfig({
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
export function createTableViewSource<
    TData,
    TResult extends Partial<IListResult<TData>>,
    TFilter = unknown,
    TOrdering = TData
>(
    config: TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions {
    return createExtendableTableViewSource<TData, TFilter>(
        config,
        config.loadFn,
        getDefaultQueryParams(config as HasTypedQueryParams<TFilter, TOrdering>)
    );
}

export function createTypedFactory<TData, TPartial extends Record<string, any> = {}>(partialConfig?: TPartial) {
    return <TFilter, TResult extends Partial<IListResult<TData>>, TOrdering = TData>(
        config: TypedTableViewSourceConfigPartial<TData, TResult, TFilter, TOrdering, TPartial>
    ): TableViewSourceWithSignals<TData, TFilter> & Extensions =>
        createTableViewSource({
            ...partialConfig,
            ...config,
        } as any) as any;
}

