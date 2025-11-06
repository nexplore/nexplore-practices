import { IListResult, IOrdering, OrderDirection } from '@nexplore/practices-ui';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { IUserListEntry } from './model';

function generateUsers(amount: number) {
    const users: IUserListEntry[] = [];
    for (let i = 0; i < amount; i++) {
        users.push({ id: '' + i, firstname: 'Firstname ' + i, lastname: 'Lastname ' + i });
    }

    return users;
}

const allUsers = generateUsers(1000);

function getUsersSorted(ordering: IOrdering) {
    return allUsers.slice().sort((a, b) => {
        let comp = 0;
        if (a[ordering.field] < b[ordering.field]) {
            comp = -1;
        } else if (a[ordering.field] > b[ordering.field]) {
            comp = 1;
        }

        if (ordering.direction === OrderDirection.Desc) {
            comp = -comp;
        }

        return comp;
    });
}

export function filterableUserEndpointMock(
    firstname: string | undefined,
    lastname: string | undefined,
    skip: number | undefined,
    take: number | undefined,
    orderings: IOrdering[] | undefined,
    includeTotal: boolean | undefined
): Observable<IListResult<IUserListEntry>> {
    let relevantUsers: IUserListEntry[];
    if (orderings && orderings.length) {
        relevantUsers = getUsersSorted(orderings[0]);
    } else {
        relevantUsers = allUsers;
    }

    if (firstname) {
        relevantUsers = relevantUsers.filter((u) => u.firstname.toLowerCase().indexOf(firstname.toLowerCase()) > -1);
    }

    if (lastname) {
        relevantUsers = relevantUsers.filter((u) => u.lastname.toLowerCase().indexOf(lastname.toLowerCase()) > -1);
    }

    const pagedUsers = relevantUsers.slice(skip, skip + take);

    const result: IListResult<IUserListEntry> = { data: pagedUsers };
    if (includeTotal) {
        result.total = relevantUsers.length;
    }

    return of(result).pipe(delay(100));
}

export function userEndpointMock(
    skip: number | undefined,
    take: number | undefined,
    orderings: IOrdering[] | undefined,
    includeTotal: boolean | undefined
) {
    return filterableUserEndpointMock(undefined, undefined, skip, take, orderings, includeTotal);
}
