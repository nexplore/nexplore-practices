import { maybeAsyncToObservable, StringKeyOf } from '@nexplore/practices-ng-common-util';
import { map } from 'rxjs/operators';
import { SelectViewSource } from '../implementation/select-view-source';
import { EnhancedListViewSource, IListResult } from '../types';
import { enhanceListViewSource, getDefaultQueryParams } from '../utils/internal-util';
import { TypedSelectViewSourceConfig } from './types';

/* @internal */
export function createSelectViewSourceInternal<
    TData,
    TLabelKey extends StringKeyOf<TData> = StringKeyOf<TData>,
    TQueryParams = TData,
    TFilter extends Pick<TData, TLabelKey> = Pick<TData, TLabelKey>,
    TOrdering = Pick<TData, TLabelKey>
>(
    config: TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams, TOrdering>
): EnhancedListViewSource<SelectViewSource<TData, TFilter>> {
    const viewSource = new SelectViewSource<TData, TFilter>(
        {
            ...config,
        },
        (params) =>
            maybeAsyncToObservable(config.loadFn(params)).pipe(
                map((result) =>
                    result?.data
                        ? (result as IListResult<TData>)
                        : {
                              data: [] as TData[],
                              total: result?.total ?? 0,
                          }
                )
            ),
        getDefaultQueryParams(config) as any
    );

    return enhanceListViewSource(viewSource);
}
