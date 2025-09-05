import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IListResult, IQueryParamsWithFilter, OrderDirection } from '../types';

/**
 * An Rx operator that converts an array observable to a list result observable.
 * @param arrayResult The array observable to convert.
 */
export function arrayToListResult(): <T>(
    arrayResult: Observable<T[] | null | undefined>
) => Observable<IListResult<T>> {
    return (arrayResult) => arrayResult.pipe(map((r) => createListResultFromArray(r)));
}

/**
 * Converts an array to a list result.
 * @param array The array to convert.
 */
export function createListResultFromArray<T>(array: T[] | null | undefined): IListResult<T> {
    return { data: array ?? [], total: array?.length ? array.length : undefined };
}

/**
 * An Rx operator that converts an array observable to a list result observable.
 *
 * It also locally sorts and filters the data based on the provided query parameters.
 * @param params The query parameters to use for sorting and filtering.
 * @param options Additional options to configure the behavior.
 */
export function arrayToInMemorySortedListResult<TData, TFilter = TData>(
    params: IQueryParamsWithFilter<TFilter>,
    options?: {
        orderingOverrides?: { [key: string]: (a: TData) => number | string | Date };
        disableSorting?: boolean;
        disableFiltering?: boolean;
    }
): (data$: Observable<TData[] | null | undefined>) => Observable<IListResult<TData>> {
    return (data$) =>
        data$.pipe(
            map((originalData) => {
                return createListResultFromArrayAndApplyQueryParamsInMemory(originalData, params, options);
            })
        );
}

/**
 * Sorts an array in memory based on the provided query parameters. Manipulates the array in place.
 */
export function sortArrayByQueryParamsInMemory<TData, TFilter>(
    data: TData[],
    params: IQueryParamsWithFilter<TFilter>,
    options?: {
        orderingOverrides?: { [p: string]: (a: TData) => number | string | Date } | undefined;
    }
) {
    const field = params.orderings?.[0]?.field;
    const sortFieldHandler =
        (field && options?.orderingOverrides?.[field]) || params.orderings?.length
            ? (a: any): any => a[params.orderings![0].field]
            : null;

    if (!sortFieldHandler) {
        return data;
    }

    return data.sort((a, b) =>
        params!.orderings![0].direction === OrderDirection.Asc
            ? sortFieldHandler(a) > sortFieldHandler(b)
                ? 1
                : -1
            : sortFieldHandler(b) > sortFieldHandler(a)
            ? 1
            : -1
    );
}

/**
 * Converts an array to a list result.
 *
 * It also locally sorts and filters the data based on the provided query parameters.
 *
 * @param originalData The array to convert.
 * @param params The query parameters to use for sorting and filtering.
 * @param options Additional options to configure the behavior.
 */
export function createListResultFromArrayAndApplyQueryParamsInMemory<TData, TFilter = TData>(
    originalData: TData[] | undefined | null,
    params: IQueryParamsWithFilter<TFilter>,
    options?: {
        orderingOverrides?: {
            [key: string]: (a: TData) => number | string | Date;
        };
        disableSorting?: boolean;
        disableFiltering?: boolean;
    }
): IListResult<TData> {
    let data = originalData ? [...originalData] : [];
    if (!options?.disableSorting && params.orderings && params.orderings.length > 0) {
        data = sortArrayByQueryParamsInMemory(data, params, options);
    }

    if (!options?.disableFiltering && params.filter) {
        data = data.filter((d: any) =>
            Object.entries(params.filter as any).every(([key, value]) =>
                value === null ? true : d[key]?.toString()?.includes(value?.toString())
            )
        );
    }

    if (params.skip != null && params.take != null) {
        data = data.slice(params.skip, params.skip + params.take);
    }

    return {
        data,
        total: originalData?.length,
    };
}
