import { toSignal } from '@angular/core/rxjs-interop';
import { enhance, firstCharToUpper } from '@nexplore/practices-ng-common-util';
import { map } from 'rxjs/operators';
import { FilterableListViewSource, ListViewSource } from '../implementation/list-view-source';
import {
    EnhancedListViewSource,
    ListViewSourceEnhancements,
    OrderDirection,
    TypedQueryParamsWithFilter,
} from '../types';
import { HasTypedQueryParams } from '../types-internal';
import { enhanceWithMutableData } from './common-extensions';

export function getDefaultQueryParams<TFilter, TQueryParams>(
    config: HasTypedQueryParams<TFilter, TQueryParams> | undefined
): Partial<TypedQueryParamsWithFilter<TFilter, TQueryParams>> {
    if (!config) {
        return {};
    }

    const params =
        'orderBy' in config
            ? {
                  orderings: [
                      typeof config.orderBy === 'string'
                          ? { field: firstCharToUpper(config.orderBy), direction: OrderDirection.Asc }
                          : { ...config.orderBy, field: firstCharToUpper(config.orderBy.field) },
                  ],
              }
            : config.defaultQueryParams;

    return params as Partial<TypedQueryParamsWithFilter<TFilter, TQueryParams>>;
}

export function enhanceListViewSource<TViewSource extends ListViewSource<any>>(
    source: TViewSource
): EnhancedListViewSource<TViewSource> {
    const signalEnhancements: ListViewSourceEnhancements<TViewSource> = {
        busySignal: toSignal(source.busy$, { initialValue: false }),
        errorSignal: toSignal(source.error$, { initialValue: null }),
        queryParamsSignal: toSignal(source.queryParams$, { initialValue: {} as any }),
        pageDataSignal: toSignal(source.pageData$, { initialValue: [] }),
        totalCountSignal: toSignal(source.page$.pipe(map((p) => p?.total ?? null)), { initialValue: 0 }),
        withMutableData: (options) => enhanceWithMutableData(source as EnhancedListViewSource<TViewSource>, options),
    };

    if (source instanceof FilterableListViewSource) {
        return enhance(source, {
            ...signalEnhancements,
            filterSignal: toSignal(source.filter$),
        }) as EnhancedListViewSource<TViewSource>;
    } else {
        return enhance(source, signalEnhancements) as EnhancedListViewSource<TViewSource>;
    }
}
