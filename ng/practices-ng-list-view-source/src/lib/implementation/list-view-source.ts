import { BehaviorSubject, combineLatest, defer, EMPTY, Observable } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    share,
    switchMap,
    take,
    tap,
} from 'rxjs/operators';
import {
    IFilterableListViewSource,
    IListResult,
    IListViewSource,
    IOrdering,
    IQueryParams,
    IQueryParamsWithFilter,
} from '../types';

export class ListViewSource<TData> implements IListViewSource<TData> {
    protected nonPartialDefaults: IQueryParams | IQueryParamsWithFilter<any>;

    protected busySubject = new BehaviorSubject<boolean>(false);
    protected errorSubject = new BehaviorSubject<any>(null);
    protected queryParamsSubject = new BehaviorSubject<IQueryParams | IQueryParamsWithFilter<any>>({});

    protected pageDataSubject = new BehaviorSubject<TData[]>([]);
    protected prefetchedDataSubject = new BehaviorSubject<TData[]>([]);

    busy$ = this.busySubject.asObservable();
    error$ = this.errorSubject.asObservable();
    queryParams$ = defer(() => this.getQueryParams$(this.queryParamsSubject.asObservable()));

    page$ = defer(() => this.getQueryParams$(this.queryParamsSubject)).pipe(
        debounceTime(300),
        switchMap((e) => this.changePage(e)),
        tap((newResult) => {
            this.pageDataSubject.next(newResult.data);
            this.prefetchedDataSubject.next([]);
        }),
        share()
    );

    pageData$ = combineLatest([this.page$, this.pageDataSubject]).pipe(
        distinctUntilChanged(),
        map(() => {
            return this.pageDataSubject.value;
        })
    );

    constructor(
        private loadFn: (params: IQueryParams) => Observable<IListResult<TData>>,
        defaults: Partial<IQueryParams> = {}
    ) {
        this.nonPartialDefaults = { skip: 0, take: 15, orderings: [], includeTotal: true, ...defaults };
        this.queryParamsSubject.next(this.nonPartialDefaults);
    }

    fetchAllData(): Observable<IListResult<TData>> {
        return this.busy$.pipe(
            filter((busy) => !busy),
            take(1),
            switchMap(() => this.fetchData({ ...this.getQueryParams(), skip: 0, take: undefined }))
        );
    }

    getQueryParams(): IQueryParams | undefined {
        return this.queryParamsSubject.value;
    }

    sort(orderings: IOrdering[]) {
        this.updatePage({ orderings });
    }

    page(skip: number, take: number) {
        this.updatePage({ skip, take });
    }

    prefetchNextPage(skip: number, take: number, isLastPrefetch = false) {
        this.applyPrefetched();
        return this.prefetchData({ skip, take, includeTotal: false }).pipe(
            tap(() => isLastPrefetch && this.applyPrefetched())
        );
    }

    private prefetchData(params: Partial<IQueryParams | IQueryParamsWithFilter<any>>) {
        const newParams = { ...this.nonPartialDefaults, ...this.getQueryParams(), ...params };
        return this.fetchData(newParams).pipe(
            take(1),
            tap((newData) => this.prefetchedDataSubject.next([...this.prefetchedDataSubject.value, ...newData.data]))
        );
    }

    private applyPrefetched() {
        this.pageDataSubject.next([...this.pageDataSubject.value, ...this.prefetchedDataSubject.value]);
        this.prefetchedDataSubject.next([]);
    }

    refresh() {
        this.updatePage({});
    }

    reset() {
        this.updatePage(this.nonPartialDefaults);
    }

    update(params: Partial<IQueryParams>) {
        this.updatePage(params);
    }

    protected getQueryParams$(queryParams$: Observable<IQueryParams>) {
        return queryParams$;
    }

    protected updatePage(params: Partial<IQueryParams | IQueryParamsWithFilter<any>>) {
        const newParams = { ...this.nonPartialDefaults, ...this.getQueryParams(), ...params };
        this.queryParamsSubject.next(newParams);
    }

    protected changePage(params: IQueryParams | IQueryParamsWithFilter<any>) {
        return this.fetchData(params);
    }

    protected fetchData(params: IQueryParams | IQueryParamsWithFilter<any>) {
        this.busySubject.next(true);
        this.errorSubject.next(null);

        return this.loadFn(params).pipe(
            catchError((err: unknown) => {
                this.errorSubject.next(err as object);
                this.busySubject.next(false);

                return EMPTY;
            }),
            tap(() => this.busySubject.next(false)),
            finalize(() => this.busySubject.next(false))
        );
    }
}

export class FilterableListViewSource<TData, TFilter>
    extends ListViewSource<TData>
    implements IFilterableListViewSource<TData, TFilter>
{
    override queryParams$ = defer(() => this.getQueryParams$(this.queryParamsSubject.asObservable())) as Observable<
        IQueryParamsWithFilter<TFilter>
    >;

    /**
     * Stream of the current filter object, only emits if changed
     */
    filter$ = this.queryParams$.pipe(
        map((p) => p.filter),
        distinctUntilChanged((prev, current) => prev === current)
    );

    constructor(
        loadFn: (params: IQueryParamsWithFilter<TFilter>) => Observable<IListResult<TData>>,
        defaults: Partial<IQueryParamsWithFilter<TFilter>> = {}
    ) {
        super(loadFn as any, { filter: {} as TFilter, ...defaults });
    }

    filter(filter: TFilter) {
        return this.updatePage({ filter: filter as any, skip: 0 });
    }

    override update(params: Partial<IQueryParamsWithFilter<TFilter>>): void {
        this.updatePage(params);
    }

    override getQueryParams(): IQueryParamsWithFilter<TFilter> | undefined {
        return this.queryParamsSubject.value as IQueryParamsWithFilter<TFilter>;
    }
}
