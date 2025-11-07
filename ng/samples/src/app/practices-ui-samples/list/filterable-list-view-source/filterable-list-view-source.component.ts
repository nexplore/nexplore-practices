import { Component, OnDestroy, inject } from '@angular/core';
import {
    FilterableListViewSource,
    IFilterableListViewSource,
    IQueryParamsWithFilter,
    OrderDirection,
    StatusService,
} from '@nexplore/practices-ui';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { filterableListEndpointMock } from '../endpointMock';

interface ISampleFilter {
    param1: string | undefined;
    param2: number | undefined;
    param3: boolean;
}

@Component({
    selector: 'app-filterable-list-view-source',
    templateUrl: './filterable-list-view-source.component.html',
})
export class FilterableListViewSourceComponent implements OnDestroy {
    private statusService = inject(StatusService);

    lastRequestedApiUrl: string;
    listViewSource: IFilterableListViewSource<string, ISampleFilter>;
    filter: ISampleFilter = { param1: undefined, param2: undefined, param3: false };

    private destroy$ = new Subject<void>();

    constructor() {
        this.listViewSource = this.statusService.registerFilterableListViewSource(
            new FilterableListViewSource(
                (params: IQueryParamsWithFilter<ISampleFilter>) => {
                    return filterableListEndpointMock(
                        params.filter.param1,
                        params.filter.param2,
                        params.filter.param3,
                        params.skip,
                        params.take,
                        params.orderings,
                        params.includeTotal
                    );
                },
                { filter: this.filter }
            )
        );
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    attach() {
        this.listViewSource.pageData$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => (this.lastRequestedApiUrl = data[0]));
    }

    toggleSort() {
        let { orderings } = this.listViewSource.getQueryParams();
        if (orderings.length) {
            if (orderings[0].direction === OrderDirection.Asc) {
                orderings[0].direction = OrderDirection.Desc;
            } else {
                orderings[0].direction = OrderDirection.Asc;
            }
        } else {
            orderings = [{ field: 'FirstName', direction: OrderDirection.Asc }];
        }

        this.listViewSource.sort(orderings);
    }

    page() {
        const { skip, take } = this.listViewSource.getQueryParams();
        this.listViewSource.page(skip + take, take);
    }

    fetchAll() {
        this.listViewSource.fetchAllData().subscribe((listResult) => (this.lastRequestedApiUrl = listResult.data[0]));
    }

    refresh() {
        this.listViewSource.refresh();
    }

    reset() {
        this.listViewSource.reset();
        this.filter = { param1: undefined, param2: undefined, param3: false };
    }

    update() {
        this.listViewSource.update({
            filter: this.filter,
            skip: 30,
            take: 45,
            orderings: [{ field: 'LastName', direction: OrderDirection.Asc }],
        });
    }

    toggleCheckbox() {
        this.filter.param3 = !this.filter.param3;
    }

    applyFilter() {
        this.listViewSource.filter(this.filter);
    }
}
