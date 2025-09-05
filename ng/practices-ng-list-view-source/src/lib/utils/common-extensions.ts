import { effect, signal, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { enhance } from '@nexplore/practices-ng-common-util';
import { subscriptionEffect, withEffects } from '@nexplore/practices-ng-signals';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnhancedListViewSource, IListResult, IListViewSource, WithMutableDataOptions } from '../types';
import { sortArrayByQueryParamsInMemory } from './list-result-util';

export function enhanceWithMutableData<TViewSource extends IListViewSource<any>>(
    listViewSource: EnhancedListViewSource<TViewSource>,
    options?: WithMutableDataOptions
) {
    const source = listViewSource as EnhancedListViewSource<TViewSource> & {
        pageDataSubject: BehaviorSubject<any[]>; // Make protected member public
    };

    const originalTotalCountSignal = source.totalCountSignal;
    const originalPage$: Observable<IListResult<any>> = source.page$;
    const pageDataSignal = withEffects(signal<any[]>([]), (signal) => {
        // Write
        effect(() => {
            const value = signal();
            if (value && value !== source.pageDataSubject.value) {
                if (!options?.disableInMemorySorting) {
                    sortArrayByQueryParamsInMemory(value, source.getQueryParams());
                }

                untracked(() => source.pageDataSubject.next(value));
            }
        });

        // Read
        subscriptionEffect(() => originalPage$.subscribe((page) => untracked(() => signal.set(page?.data))));
    });

    let hasReadTotalCount = false;
    const totalCountSignal = withEffects(signal<number>(originalTotalCountSignal()), (signal) => {
        // Read
        subscriptionEffect(() =>
            originalPage$.subscribe((page) =>
                untracked(() => {
                    signal.set(page?.total ?? 0);
                    hasReadTotalCount = true;
                })
            )
        );
    });
    const totalCount$ = toObservable(totalCountSignal).pipe(filter(() => hasReadTotalCount));

    return enhance(source, {
        pageDataSignal,
        totalCountSignal,
        page$: combineLatest([toObservable(pageDataSignal), totalCount$]).pipe(
            map(([data, total]) => ({ data, total }))
        ),
    });
}
