import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { createSelectViewSourceInternal } from './extensions';
import { SelectViewSourceWithSignals, TypedSelectViewSourceConfig } from './types';

/**
 * Creates a SelectViewSource .
 * @param config A configuration object that defines the behavior of the SelectViewSource.
 */
export function createSelectViewSource<
    TData,
    TLabelKey extends StringKeyOf<TData> = StringKeyOf<TData>,
    TQueryParams = TData,
    TFilter extends Pick<TData, TLabelKey> = Pick<TData, TLabelKey>
>(config: TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>): SelectViewSourceWithSignals<TData, TFilter> {
    return createSelectViewSourceInternal<TData, TLabelKey, TQueryParams>(config) as any;
}

export function createTypedFactory<TData>() {
    return <TLabelKey extends StringKeyOf<TData> = StringKeyOf<TData>,
        TQueryParams = TData,
        TFilter extends Pick<TData, TLabelKey> = Pick<TData, TLabelKey>
    >(config: TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams>): SelectViewSourceWithSignals<TData, TFilter> =>
        createSelectViewSource(config)
}
