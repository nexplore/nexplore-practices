import { AfterViewInit, ChangeDetectorRef, Directive, HostListener, Input, OnDestroy } from '@angular/core';
import {
    ClrDatagrid,
    ClrDatagridComparatorInterface,
    ClrDatagridPagination,
    ClrDatagridSortOrder,
    ClrDatagridStateInterface,
    DatagridPropertyComparator,
} from '@clr/angular';
import {
    IFilterableListViewSource,
    IListResult,
    IListViewSource,
    IOrdering,
    IQueryParams,
    IQueryParamsWithFilter,
    OrderDirection,
} from '@nexplore/practices-ui';
import { asyncScheduler, BehaviorSubject, merge, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, observeOn, skip, startWith, switchMap, tap } from 'rxjs/operators';

@Directive({
    selector: 'clr-datagrid[puiclrListViewSource]',
    standalone: true,
})
export class DatagridListViewSourceDirective implements AfterViewInit, OnDestroy {
    @HostListener('clrDgRefresh', ['$event'])
    onDatagridRefresh(state: ClrDatagridStateInterface) {
        this.datagridStateSubject.next(state);
    }

    private listViewSourceSubject = new BehaviorSubject<
        IListViewSource<{}> | IFilterableListViewSource<{}, {}> | undefined
    >(undefined);
    private datagridStateSubject = new Subject<ClrDatagridStateInterface>();
    private subscription: Subscription;
    private previousDatagridState: ClrDatagridStateInterface;
    private previousFilters: {};
    private ignoreNextDatagridStateChange = false;

    @Input()
    set puiclrListViewSource(value) {
        this.listViewSourceSubject.next(value);
    }

    @Input()
    pagination: ClrDatagridPagination;

    @Input()
    filterConverter: (filter: {}[]) => {};

    constructor(private datagrid: ClrDatagrid, private cdr: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.subscription = this.listViewSourceSubject
            .pipe(
                switchMap((listViewSource) => {
                    return merge(
                        listViewSource.busy$.pipe(
                            skip(1),
                            startWith(true),
                            // Throws "ExpressionChangedAfterItHasBeenCheckedError" if not added
                            observeOn(asyncScheduler),
                            tap((busy) => {
                                this.datagrid.loading = busy;
                                this.cdr.markForCheck();
                            })
                        ),
                        (listViewSource.queryParams$ as Observable<IQueryParams>).pipe(
                            observeOn(asyncScheduler),
                            map((queryParams) => queryParams && queryParams.orderings),
                            distinctUntilChanged(),
                            tap((orderings) => {
                                this.setDatagridSorting(orderings);
                            })
                        ),
                        listViewSource.page$.pipe(
                            tap((pageData) => {
                                this.setDatagridPagination(pageData, listViewSource);
                            })
                        ),
                        this.datagridStateSubject.pipe(
                            tap((state) => {
                                this.processDatagridStateChange(state, listViewSource);
                            })
                        ),
                        /* This is a workaround which likely never gets fixed.
                        See https://github.com/vmware/clarity/issues/2978#issuecomment-479785476 */
                        this.datagrid.rows.changes.pipe(
                            tap(() =>
                                setTimeout(() => {
                                    this.datagrid.resize();
                                })
                            )
                        )
                    );
                })
            )
            .subscribe();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private setDatagridPagination(
        pageData: IListResult<{}>,
        listViewSource: IListViewSource<{}> | IFilterableListViewSource<{}, {}>
    ) {
        const queryParams = listViewSource.getQueryParams();

        if (!isNaN(queryParams.skip) && !isNaN(queryParams.take) && queryParams.skip % queryParams.take !== 0) {
            throw new Error('The Clarity Datagrid needs skip to be a multiple of take');
        }

        if (queryParams.take !== this.pagination.pageSize) {
            this.ignoreNextDatagridStateChange = true;
            this.pagination.pageSize = queryParams.take;
        }
        if (pageData.total !== this.pagination.totalItems) {
            this.pagination.totalItems = pageData.total;
        }

        if (queryParams.skip) {
            const calculatedCurrentpage = Math.floor(queryParams.skip / this.pagination.pageSize) + 1;
            if (calculatedCurrentpage !== this.pagination.currentPage) {
                this.ignoreNextDatagridStateChange = true;
                this.pagination.currentPage = calculatedCurrentpage;
            }
        }
    }

    private setDatagridSorting(orderings: IOrdering[]) {
        if (!orderings.length) {
            this.clearDatagridSorting();
            return;
        }

        // Clarity only supports a single ordering ATM
        const singleOrdering = orderings[0];
        this.updateDatagridSorting(singleOrdering);
    }

    private processDatagridStateChange(
        state: ClrDatagridStateInterface,
        listViewSource: IListViewSource<{}> | IFilterableListViewSource<{}, {}>
    ) {
        if (this.previousDatagridState === undefined) {
            this.previousDatagridState = state;
        }

        if (this.ignoreNextDatagridStateChange) {
            this.ignoreNextDatagridStateChange = false;
            return;
        }

        let params: Partial<IQueryParams | IQueryParamsWithFilter<{}>>;
        if (
            this.supportsFiltering(listViewSource) &&
            this.valueChanged(state.filters, this.previousDatagridState.filters)
        ) {
            const newFilters = this.filterConverter(state.filters);
            if (this.valueChanged(newFilters, this.previousFilters)) {
                this.previousFilters = newFilters;
                params = Object.assign({}, params, { filter: newFilters });
            }
        }

        if (state.page && this.valueChanged(state.page, this.previousDatagridState.page)) {
            const skipValue = state.page.from >= 0 ? state.page.from : 0;
            params = Object.assign({}, params, { skip: skipValue, take: state.page.size });
        }

        if (state.sort && this.valueChanged(state.sort, this.previousDatagridState.sort)) {
            const orderings = this.getOrderingsFromState(state);
            params = Object.assign({}, params, { orderings });
        }

        if (params) {
            listViewSource.update(params);
        }

        this.previousDatagridState = state;
    }

    private valueChanged(newValue: {}, previousValue: {}) {
        return JSON.stringify(newValue) !== JSON.stringify(previousValue);
    }

    private getOrderingsFromState(state: ClrDatagridStateInterface): IOrdering[] {
        if ((state.sort.by as ClrDatagridComparatorInterface<{}>).compare !== undefined) {
            throw new Error('Clarity sort comparators are not supported with ListViewSource');
        }

        return [
            {
                field: state.sort.by,
                direction: state.sort.reverse ? OrderDirection.Desc : OrderDirection.Asc,
            } as IOrdering,
        ];
    }

    private clearDatagridSorting() {
        this.datagrid.columns
            .filter((column) => column.sortable)
            .forEach((column) => {
                if (column.sortOrder !== ClrDatagridSortOrder.UNSORTED) {
                    this.ignoreNextDatagridStateChange = true;
                    column.sortOrder = ClrDatagridSortOrder.UNSORTED;
                }
            });
    }

    private updateDatagridSorting(ordering: IOrdering) {
        this.datagrid.columns
            .filter((c) => c.sortBy && (c.sortBy as DatagridPropertyComparator).prop !== undefined)
            .forEach((column) => {
                let newSortOrder = ClrDatagridSortOrder.UNSORTED;
                if ((column.sortBy as DatagridPropertyComparator).prop === ordering.field) {
                    newSortOrder = this.getClrSortOrderFromOrderDirection(ordering.direction);
                }

                if (column.sortOrder !== newSortOrder) {
                    this.ignoreNextDatagridStateChange = true;
                    column.sortOrder = newSortOrder;
                }
            });

        return false;
    }

    private getClrSortOrderFromOrderDirection(direction: OrderDirection) {
        if (direction === OrderDirection.Asc) {
            return ClrDatagridSortOrder.ASC;
        } else {
            return ClrDatagridSortOrder.DESC;
        }
    }

    private supportsFiltering(listViewSource: IListViewSource<{}> | IFilterableListViewSource<{}, {}>) {
        const filterableListViewSource = listViewSource as IFilterableListViewSource<{}, {}>;
        return this.filterConverter !== undefined && filterableListViewSource.filter !== undefined;
    }
}
