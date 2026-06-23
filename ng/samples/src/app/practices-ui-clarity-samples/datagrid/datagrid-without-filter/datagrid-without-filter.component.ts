import { Component } from '@angular/core';
import { createListViewSource, IListViewSource, OrderDirection } from '@nexplore/practices-ui';

import { userEndpointMock } from '../endpointMocks';
import { IUserListEntry } from '../model';

@Component({
    selector: 'app-datagrid-without-filter',
    templateUrl: './datagrid-without-filter.component.html',
    standalone: false
})
export class DatagridWithoutFilterComponent {
    userSource: IListViewSource<IUserListEntry> = createListViewSource(
        userEndpointMock,

        { orderings: [{ field: 'lastname', direction: OrderDirection.Asc }] }
    );

    trackById(index: number, item: IUserListEntry) {
        return item.id;
    }
}
