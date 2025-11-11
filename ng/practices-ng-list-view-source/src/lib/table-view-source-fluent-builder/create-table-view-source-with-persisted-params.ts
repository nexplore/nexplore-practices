import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaybeAsync } from '@angular/router';
import { firstValueFromMaybeAsync, isObjDeepEqual, subscribeAndForget } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { defer, firstValueFrom, skip, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TableViewSource } from '../implementation/table-view-source';
import { IListResult, IQueryParams, TypedQueryParamsWithFilter } from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { getDefaultQueryParams } from '../utils/internal-util';
import { createExtendableTableViewSource, Extensions, ExtractDataTypeFrom, ExtractFilterTypeFrom } from './extensions';
import { TableViewSourceWithSignals, TypedTableViewSourceConfig } from './types';

export type PersistParamsConfig<TFilter, TData> = {
    /**
     * The filter form, whose value changes will update the filter params of the TableViewSource.
     */
    persistParams: {
        /**
         * Saves the query params to a persistent storage.
         * @param params
         */
        save: (params: TypedQueryParamsWithFilter<TFilter, TData>) => MaybeAsync<void>;

        /**
         * Loads the query params from a persistent storage.
         */
        load: () => MaybeAsync<TypedQueryParamsWithFilter<TFilter, TData>>;
    };
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
 *
 * export function persistParamsInCurrentNavigation(): {
 *     save: (queryParams: any) => void; load: () => any
 * } {
 *     const location = inject(NgLocation);
 *     return {
 *       save: (queryParams: any) => {
 *           location.replaceState(location.path(true), window.location.search, {
 *               ...(location.getState() as any),
 *               queryParams,
 *           });
 *       },
 *       load: () => {
 *           const state = location.getState() as any;
 *           return state.queryParams;
 *       },
 *     };
 * }
 *
 *
 * readonly myTableViewSource = tableViewSource.withPersistedParams({
 *     columns: [
 *         { fieldName: 'referenceNumber', columnLabelKey: 'Labels.AssessmentReferenceNumber' },
 *         { fieldName: 'currentStateDisplayName', columnLabelKey: 'Labels.Status' },
 *         { fieldName: 'isIhpAssessment', columnLabelKey: 'Labels.BusinessType' },
 *         { fieldName: 'createdOn', columnLabelKey: 'Labels.CreatedOn' },
 *     ],
 *     sortBy: 'createdOn',
 *     loadFn: (params) => {
 *         return this._api.getAssessmentListEntries(params.skip, params.take, params.orderings, params.includeTotal, params.filter);
 *     },
 *     persistParams: persistParamsInCurrentNavigation(),
 * });
 * ```
 */
export function createTableViewSourceWithPersistedParams<
    TData,
    TFilter,
    TResult extends Partial<IListResult<TData>>,
    TOrdering = TData
>(
    config: PersistParamsConfig<TFilter, TData> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
): TableViewSourceWithSignals<TData, TFilter> & Extensions {
    const tableViewSource = createExtendableTableViewSource<TData, TFilter>(
        config,
        config.loadFn,
        getDefaultQueryParams(config as HasTypedQueryParams<TFilter, TOrdering>)
    );

    extendWithPersistedParams.call(tableViewSource, config);

    return tableViewSource;
}

export function createdTypedWithPersistedParamsFactory<TData>() {
    return <TFilter, TResult extends Partial<IListResult<TData>>, TOrdering = TData>(
        config: PersistParamsConfig<TFilter, TData> & TypedTableViewSourceConfig<TData, TResult, TFilter, TOrdering>
    ) => createTableViewSourceWithPersistedParams(config);
}

/**
 * Extends the TableViewSource with the ability to persist the query parameters.
 *
 * Example:
 * ```ts
 * export function persistParamsInCurrentNavigation(): PersistParamsConfig {
 *     const location = inject(NgLocation);
 *     return {
 *         persistParams: {
 *             save: (queryParams: any) => {
 *                 location.replaceState(location.path(true), window.location.search, {
 *                     ...(location.getState() as any),
 *                     queryParams,
 *                 });
 *             },
 *             load: () => {
 *                 const state = location.getState() as any;
 *                 return state.queryParams;
 *             },
 *         },
 *     };
 * }
 *
 * protected readonly myTableViewSource = tableViewSource.with...({...})
 *                      .withPersistedParams(persistParamsInCurrentNavigation());
 * ```
 *
 * @param config A object containing the persistParams object with the save and load functions.
 */
export function extendWithPersistedParams<TTableViewSource extends TableViewSource<any, any>>(
    this: TTableViewSource,
    config: PersistParamsConfig<ExtractFilterTypeFrom<TTableViewSource>, ExtractDataTypeFrom<TTableViewSource>>
): TTableViewSource {
    if (config.persistParams) {
        const destroyRef = inject(DestroyRef);
        subscribeAndForget(
            defer(async () => {
                // if (this.defaults.take) {
                //     await firstValueFrom(timer(0)); // First timer is needed so that the ui notices the change
                //     trace('tableViewSourceWithPersistedParams', 'apply page settings from defaults', {
                //         defaults: this.defaults,
                //     });
                //     this.page(this.defaults.skip ?? 0, this.defaults.take!);

                //     await firstValueFrom(timer(0)); // Second timer is needed so the queryParams$ subscription below doesn't get triggered unnecessarily.
                // }

                // Get initial list state
                const latestPersistedParams: IQueryParams | null = await firstValueFromMaybeAsync(
                    config.persistParams.load()
                );
                trace('tableViewSourceWithPersistedParams', 'loaded initial query params', latestPersistedParams);
                if (latestPersistedParams) {
                    await firstValueFrom(timer(0)); // First timer is needed so that the ui notices the change
                    this.update(latestPersistedParams);
                    await firstValueFrom(timer(0)); // Second timer is needed so the queryParams$ subscription below doesn't get triggered unnecessarily.
                }

                subscribeAndForget(
                    this.queryParams$.pipe(
                        skip(1),
                        distinctUntilChanged((a, b) => {
                            return isObjDeepEqual(a, b, { maximumDepth: 3 });
                        }),
                        debounceTime(100),
                        switchMap((queryParams) => {
                            if (!isObjDeepEqual(queryParams, latestPersistedParams, { maximumDepth: 3 })) {
                                trace('tableViewSourceWithPersistedParams', 'persist query params', {
                                    queryParams,
                                    latestPersistedParams,
                                });
                                return firstValueFromMaybeAsync(config.persistParams.save(queryParams as any));
                            } else {
                                return Promise.resolve();
                            }
                        }),
                        takeUntilDestroyed(destroyRef)
                    )
                );
            })
        );
    }

    return this;
}

