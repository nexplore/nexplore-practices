import { effect, isSignal, untracked } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { isObjDeepEqual, isObjShallowEqual, unwrapSignalLike, ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { formGroupCurrentValueSignal, FormGroupValues, TypedFormGroup } from '@nexplore/practices-ng-forms';
import { trace } from '@nexplore/practices-ng-logging';
import { subscriptionEffect } from '@nexplore/practices-ng-signals';
import { TableViewSource } from '../implementation/table-view-source';
import { IListResult } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { getDefaultQueryParams } from '../utils/internal-util';
import { createExtendableTableViewSource, Extensions } from './extensions';
import {
    TableViewSourceWithSignals,
    TypedTableViewSourceConfig,
    TypedTableViewSourceConfigPartial,
    TypedTableViewSourceFilter,
} from './types';

type ShouldApplyFilterFormValueFn<TForm extends FormGroup> = (context: {
    form: TForm;
    hasChanged: boolean;
    previousFilter?: unknown;
}) => boolean;

type AdditionalConfig<TForm extends FormGroup> = {
    /**
     * The filter form, whose value changes will update the filter params of the TableViewSource.
     */
    filterForm: ValueOrSignal<TForm>;

    /**
     * Determines whether a form value change should be pushed to the TableViewSource.
     * Defaults to only applying values when the value has changed.
     */
    shouldApplyFilterFormValue?: ShouldApplyFilterFormValueFn<TForm>;
};

const defaultShouldApplyFilterFormValue: ShouldApplyFilterFormValueFn<FormGroup> = ({ hasChanged }) => hasChanged;

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

export function createTypedWithFilterFormFactory<TData, TPartialConfig extends Record<string, any> = {}>(
    partialConfig?: TPartialConfig
) {
    return <
        TFilter extends TypedTableViewSourceFilter<TForm, TResult>,
        TForm extends FormGroup,
        TResult extends Partial<IListResult<TData>>,
        TOrdering = TData
    >(
        config: AdditionalConfig<TForm> &
            TypedTableViewSourceConfigPartial<TData, TResult, TFilter, TOrdering, TPartialConfig>
    ): TableViewSourceWithSignals<TData, TFilter> & Extensions =>
        createTableViewSourceWithFilterForm({
            ...partialConfig,
            ...config,
        } as any);
}

type TypedFormGroupOrUntyped<TTableViewSource extends TableViewSource<any, any>> =
    TTableViewSource extends TableViewSource<any, infer TFilter>
        ? TFilter extends Record<string, any>
            ? TypedFormGroup<TFilter>
            : UntypedFormGroup
        : UntypedFormGroup;

type ExtendWithFilterFormConfig<TTableViewSource extends TableViewSource<any, any>, TForm extends FormGroup> =
    | AdditionalConfig<TypedFormGroupOrUntyped<TTableViewSource> | TForm>
    | ValueOrSignal<TypedFormGroupOrUntyped<TTableViewSource> | TForm>;

/* @internal */
export function extendWithFilterForm<
    TTableViewSource extends TableViewSource<any, FormGroupValues<TForm> | any>,
    TForm extends FormGroup
>(this: TTableViewSource, config: ExtendWithFilterFormConfig<TTableViewSource, TForm>): TTableViewSource {
    const filterForm = config instanceof AbstractControl || isSignal(config) ? config : config.filterForm;
    const defaultCondition = defaultShouldApplyFilterFormValue as ShouldApplyFilterFormValueFn<
        TypedFormGroupOrUntyped<TTableViewSource>
    >;
    const shouldApplyFilterFormValue =
        config instanceof AbstractControl || isSignal(config)
            ? defaultCondition
            : config.shouldApplyFilterFormValue ?? defaultCondition;
    if (filterForm) {
        const formGroupValueSignal = formGroupCurrentValueSignal(filterForm, {
            debounceTime: 300,
        });

        effect(() => {
            const formValue = formGroupValueSignal();
            const previousParams = this.getQueryParams().filter;
            const hasChanged = !isObjShallowEqual(formValue, previousParams, undefined, (a, b) => {
                a = a ?? '';
                b = b ?? '';
                return a === b;
            });

            const formInstance = unwrapSignalLike(filterForm) as TypedFormGroupOrUntyped<TTableViewSource>;
            const shouldApplyFilters = shouldApplyFilterFormValue({
                form: formInstance,
                previousFilter: previousParams,
                hasChanged,
            });
            if (shouldApplyFilters) {
                untracked(() => {
                    trace('tableViewSource', 'apply form value to filter', {
                        formValue,
                        previousParams,
                        hasChanged,
                        formInstance,
                    });
                    this.filter(formValue);

                    const currentQueryParams = this.getQueryParams();
                    if (currentQueryParams.skip !== 0) {
                        trace('tableViewSource', 'reset page', {
                            formValue,
                            previousParams,
                            hasChanged,
                            currentQueryParams,
                        });
                        this.page(0, currentQueryParams.take!); // Reset page when filtering, TODO: Should this be done in implementation class?
                    }
                });
            }
        });

        // If the filters change from outside, make sure the filter form has those changes reflected
        subscriptionEffect(() =>
            this.filter$.subscribe((filters) => {
                const form = unwrapSignalLike(filterForm);
                const hasChanged = !isObjDeepEqual(filters, form.value, { maximumDepth: 3 });
                if (hasChanged) {
                    trace('tableViewSource', 'apply filter to form', {
                        filters,
                        formValue: form.value,
                    });
                    form.patchValue(filters);
                } else {
                    trace('tableViewSource', 'skip applying filter to form, no changes', {
                        filters,
                        formValue: form.value,
                    });
                }
            })
        );
    }

    return this;
}
