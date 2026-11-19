import type { IListResult, IListViewSource, IOrdering, IQueryParams } from '@nexplore/practices-ng-list-view-source';
import { ListViewSource } from '@nexplore/practices-ng-list-view-source';
import type { Observable } from 'rxjs';

export {
    FilterableListViewSource,
    IFilterableListViewSource,
    IListViewSource,
    ListViewSource,
} from '@nexplore/practices-ng-list-view-source';

/* @deprecated */
export function createListViewSource<TData>(
    queryFn: (
        skip: number,
        take: number,
        orderings: IOrdering[],
        includeTotal: boolean
    ) => Observable<IListResult<TData>>,
    defaults?: Partial<IQueryParams>
): IListViewSource<TData> {
    return new ListViewSource(
        (ev) => queryFn(ev.skip ?? 0, ev.take ?? 0, ev.orderings ?? [], ev.includeTotal ?? false),
        defaults
    );
}
