import { createSelectViewSourceInternal } from './extensions';
import {
    SelectViewSourceFilterType,
    SelectViewSourceLabelKey,
    SelectViewSourceWithSignals,
    TypedSelectViewSourceConfig,
} from './types';

/**
 * Creates a SelectViewSource .
 * @param config A configuration object that defines the behavior of the SelectViewSource.
 */
export function createSelectViewSource<
    TData,
    TLabelKey extends SelectViewSourceLabelKey<TData>,
    TQueryParams = TData,
    TFilter extends SelectViewSourceFilterType<TData, TLabelKey> = SelectViewSourceFilterType<TData, TLabelKey>,
    TOrdering = TData
>(
    config: TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams, TOrdering>
): SelectViewSourceWithSignals<TData, TFilter> {
    return createSelectViewSourceInternal<TData, TLabelKey, TQueryParams, TFilter, TOrdering>(config) as any;
}

export function createTypedFactory<TData>() {
    return <
        TLabelKey extends SelectViewSourceLabelKey<TData>,
        TQueryParams,
        TFilter extends SelectViewSourceFilterType<TData, TLabelKey>,
        TOrdering = TData
    >(
        config: TypedSelectViewSourceConfig<TData, TLabelKey, TQueryParams, TOrdering>
    ): SelectViewSourceWithSignals<TData, TFilter> => createSelectViewSource(config);
}
