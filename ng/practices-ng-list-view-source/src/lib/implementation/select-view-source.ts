import { Observable } from 'rxjs';
import { IListResult, IQueryParamsWithFilter } from '../types';
import { FilterableListViewSource } from './list-view-source';

export interface SelectViewSourceConfig<TData> {
    // The label property to display in the select
    label?: keyof TData;

    // The value property to bind
    value?: keyof TData;

    // True when the select should be searchable, false otherwise. Default is true.
    searchable?: boolean;

    // True when the select should filter interally using a simple text search, false otherwise. Default is false.
    localSearch?: boolean;
}

export class SelectViewSource<TData, TFilter = TData>
    extends FilterableListViewSource<TData, TFilter>
    implements SelectViewSourceConfig<TData>
{
    label?: keyof TData;
    value?: keyof TData;

    searchable?: boolean = true;
    localSearch?: boolean = false;

    constructor(
        config: SelectViewSourceConfig<TData>,
        loadFn: (params: IQueryParamsWithFilter<TFilter>) => Observable<IListResult<TData>>,
        defaults: Partial<IQueryParamsWithFilter<TFilter>> = {}
    ) {
        // TODO: Implement paging / virtual scrolling. Taking the first 200 elements for now.
        super(loadFn, { filter: {} as TFilter, skip: 0, take: 200, ...defaults });
        Object.assign(this, config);
    }
}
