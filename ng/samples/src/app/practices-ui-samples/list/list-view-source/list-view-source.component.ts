import { Component, OnDestroy } from '@angular/core';
import { createListViewSource, IListViewSource, OrderDirection, StatusService } from '@nexplore/practices-ui';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { listEndpointMock } from '../endpointMock';

@Component({
    selector: 'app-list-view-source',
    templateUrl: './list-view-source.component.html',
})
export class ListViewSourceComponent implements OnDestroy {
    lastRequestedApiUrl: string;
    listViewSource: IListViewSource<string>;

    private destroy$ = new Subject<void>();

    constructor(private statusService: StatusService) {
        this.listViewSource = this.statusService.registerListViewSource(
            createListViewSource(listEndpointMock, { take: 30 })
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
    }

    update() {
        this.listViewSource.update({
            skip: 30,
            take: 45,
            orderings: [{ field: 'LastName', direction: OrderDirection.Asc }],
        });
    }
}
