import { IListResult, IOrdering } from '@nexplore/practices-ui';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export function filterableListEndpointMock(
    param1: string | undefined,
    param2: number | undefined,
    param3: boolean | undefined,
    skip: number | undefined,
    take: number | null | undefined,
    orderings: IOrdering[],
    includeTotal: boolean | undefined
): Observable<IListResult<string>> {
    let url = '<endpointUrl>?';

    if (param1 !== undefined) {
        url += 'Param1=' + encodeURIComponent('' + param1) + '&';
    }
    if (param2 !== undefined) {
        url += 'Param2=' + encodeURIComponent('' + param2) + '&';
    }
    if (param3 !== undefined) {
        url += 'Param3=' + encodeURIComponent('' + param3) + '&';
    }
    if (skip !== undefined) {
        url += 'Skip=' + encodeURIComponent('' + skip) + '&';
    }
    if (take !== undefined && take !== null) {
        url += 'Take=' + encodeURIComponent('' + take) + '&';
    }

    if (orderings && orderings.length) {
        orderings.forEach((ordering, index) => {
            for (const attribute in ordering) {
                if (Object.prototype.hasOwnProperty.call(ordering.hasOwnProperty, attribute)) {
                    url +=
                        'Orderings[' +
                        index +
                        '].' +
                        attribute +
                        '=' +
                        encodeURIComponent('' + ordering[attribute]) +
                        '&';
                }
            }
        });
    }

    if (includeTotal !== undefined) {
        url += 'IncludeTotal=' + encodeURIComponent('' + includeTotal) + '&';
    }
    url = url.replace(/[?&]$/, '');

    if (skip === 60) {
        return throwError({ toString: () => 'An Error occurred while loading result #60' });
    }

    return of({ data: [url], total: 1 }).pipe(delay(100));
}

export function listEndpointMock(
    skip: number | undefined,
    take: number | null | undefined,
    orderings: IOrdering[],
    includeTotal: boolean | undefined
): Observable<IListResult<string>> {
    return filterableListEndpointMock(undefined, undefined, undefined, skip, take, orderings, includeTotal);
}
