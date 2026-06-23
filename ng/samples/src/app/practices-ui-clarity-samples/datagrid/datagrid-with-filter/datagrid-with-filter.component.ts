import { Component } from '@angular/core';
import {
    FilterableListViewSource,
    IFilterableListViewSource,
    IQueryParamsWithFilter,
    OrderDirection,
} from '@nexplore/practices-ui';

import { filterableUserEndpointMock } from '../endpointMocks';
import { IUserListEntry } from '../model';

interface IUserFilter {
    firstname?: string;
    lastname?: string;
}

@Component({
    selector: 'app-datagrid-with-filter',
    templateUrl: './datagrid-with-filter.component.html',
    standalone: false
})
export class DatagridWithFilterComponent {
    userSource: IFilterableListViewSource<IUserListEntry, IUserFilter> = new FilterableListViewSource(
        (params: IQueryParamsWithFilter<IUserFilter>) => {
            return filterableUserEndpointMock(
                params.filter.firstname,
                params.filter.lastname,
                params.skip,
                params.take,
                params.orderings,
                true
            );
        },
        { orderings: [{ field: 'lastname', direction: OrderDirection.Asc }] }
    );

    trackById(index: number, item: IUserListEntry) {
        return item.id;
    }

    convertToUserFilter(filter: any[]): IUserFilter {
        const userFilter: IUserFilter = {};
        if (filter && filter.length) {
            for (const filterEntry of filter) {
                if (filterEntry.property === 'firstname') {
                    userFilter.firstname = filterEntry.value;
                } else if (filterEntry.property === 'lastname') {
                    userFilter.lastname = filterEntry.value;
                }
            }
        }

        return userFilter;
    }
}
