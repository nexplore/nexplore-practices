import { effect, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { isObjDeepEqual, isObjShallowEqual, unwrapSignalLike } from '@nexplore/practices-ng-common-util';
import { formGroupCurrentValueSignal, TypedPartialFormGroup } from '@nexplore/practices-ng-forms';
import { trace } from '@nexplore/practices-ng-logging';
import { debounceTime } from 'rxjs/operators';
import { TableViewSource } from '../implementation/table-view-source';
import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { getDefaultQueryParams } from '../utils/internal-util';
import {
    createExtendableTableViewSource,
    Extensions,
    ExtractFilterTypeFrom,
    ExtractResultTypeFrom,
} from './extensions';
import { TableViewSourceWithSignals, TypedTableViewSourceConfig, TypedTableViewSourceFilter } from './types';

type AdditionalConfig<TForm extends FormGroup> = {
    /**
     * The filter form, whose value changes will update the filter params of the TableViewSource.
     */
    filterForm?: TForm | Signal<TForm>;
};

/**
 * Creates a TableViewSource that is typed and is connected to a filter form.
 *
 * - Allows to bind a filter `FormGroup` to the `TableViewSource`, which will automatically update its filter params when the form changes.
 *
 * Note: Must be created within a injection context (e.g. constructor of a component or service).
 *
 * Example:
 * ```ts
 * readonly assessmentSource = tableViewSource.withFilterForm({
 *     columns: [
 *         { fieldName: 'referenceNumber', columnLabelKey: 'Labels.AssessmentReferenceNumber' },
 *         { fieldName: 'currentStateDisplayName', columnLabelKey: 'Labels.Status' },
 *         { fieldName: 'isIhpAssessment', columnLabelKey: 'Labels.BusinessType' },
 *         { fieldName: 'createdOn', columnLabelKey: 'Labels.CreatedOn' },
 *     ],
 *     filterForm: this.filterForm,
 *     defaultQueryParams: {
 *         orderings: [{ field: 'createdOn', direction: OrderDirection.Desc }],
 *     },
 *     loadFn: (params) => {
 *         return this._api.getAssessmentListEntries(params.skip, params.take, params.orderings, params.includeTotal, params.filter);
 *     },
 * });
 * ```
 */
export function createTableViewSourceWithFilterForm<
    TData,
    TFilter extends TypedTableViewSourceFilter<TForm, TResult>,
    TForm extends FormGroup,
    TResult extends Partial<IListResult<TData>>,
    TOrdering = TData
>(
    config: AdditionalConfig<TForm> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions {
    const tableViewSource = createExtendableTableViewSource<TData, TFilter>(
        config,
        config.loadFn,
        getDefaultQueryParams(config as HasTypedQueryParams<TFilter, TOrdering>)
    );

    extendWithFilterForm.call(tableViewSource, config as any);

    return tableViewSource;
}

export function createTypedWithFilterFormFactory<TData>() {
    return <
        TFilter extends TypedTableViewSourceFilter<TForm, TResult>,
        TForm extends FormGroup,
        TResult extends Partial<IListResult<TData>>,
        TOrdering = TData
    >(config: AdditionalConfig<TForm> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>) =>
        createTableViewSourceWithFilterForm(config)
}

/* @internal */
export function extendWithFilterForm<
    TTableViewSource extends TableViewSource<any, any>,
    TFilter extends TypedTableViewSourceFilter<
        TypedPartialFormGroup<ExtractFilterTypeFrom<TTableViewSource>>,
        ExtractResultTypeFrom<TTableViewSource>
    >
>(this: TTableViewSource, config: AdditionalConfig<TypedPartialFormGroup<TFilter>>): TTableViewSource {
    if (config.filterForm) {
        const filterForm = config.filterForm;
        const formGroupValueSignal = formGroupCurrentValueSignal(filterForm as any, {
            debounceTime: 300,
        });

        effect(() => {
            const formValue = formGroupValueSignal() as TFilter;
            const previousParams = this.getQueryParams().filter;
            const hasChanged = !isObjShallowEqual(formValue, previousParams, undefined, (a, b) => {
                a = a ?? '';
                b = b ?? '';
                return a === b;
            });
            if (formValue && hasChanged) {
                this.filter(formValue);
                const currentQueryParams = this.getQueryParams();
                if (currentQueryParams.skip !== 0) {
                    this.page(0, currentQueryParams.take!); // Reset page when filtering, TODO: Should this be done in implementation class?
                }

                trace('tableViewSource', 'filter', {
                    formValue,
                    previousParams,
                    hasChanged,
                    queryParams: this.getQueryParams(),
                });
            }
        });

        // If the filters change from outside, make sure the filter form has those changes reflected
        this.filter$.pipe(debounceTime(100), takeUntilDestroyed()).subscribe((filters) => {
            const form = unwrapSignalLike(filterForm);
            const hasChanged = !isObjDeepEqual(filters, form.value, { maximumDepth: 3 });
            if (hasChanged) {
                trace('tableViewSource', 'apply filter to form', {
                    filters,
                    formValue: form.value,
                });
                form.patchValue(filters);
            }
        });
    }

    return this;
}
