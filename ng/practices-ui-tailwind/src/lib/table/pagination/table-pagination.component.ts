/*
 * Copyright (c) 2016-2023 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of https://github.com/vmware-clarity/ng-clarity.
 */

import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, merge, Observable, startWith, Subscription, switchMap, takeUntil, tap } from 'rxjs';

import { PuiIconArrowEndComponent } from '../../icons/icon-arrow-end.component';
import { PuiIconArrowSlidingComponent } from '../../icons/icon-arrow-sliding.component';
import { PuiTableComponent } from '../table.component';
import { DEFAULT_PAGE_SIZE } from './config';
import { PageService } from './page.service';
import { PuiTablePageSizeComponent } from './table-page-size.component';

@Component({
    standalone: true,
    selector: 'pui-table-pagination',
    templateUrl: './table-pagination.component.html',
    providers: [DestroyService],
    imports: [TranslateModule, PuiIconArrowEndComponent, PuiIconArrowSlidingComponent],
})
export class PuiTablePaginationComponent implements OnDestroy, OnInit {
    private _table = inject(PuiTableComponent);
    private _destroy$ = inject(DestroyService);
    page = inject(PageService);

    /**
     * Subscription to the page service changes
     */
    private _pageSubscription: Subscription;

    @HostBinding('class')
    className = 'flex justify-between';

    @ContentChild(PuiTablePageSizeComponent) _pageSizeComponent: PuiTablePageSizeComponent;
    @ViewChild('currentPageInput') currentPageInputRef: ElementRef;

    readonly commonStringsKeys = {
        firstPage: 'Practices.Labels_Table_FirstPage',
        lastPage: 'Practices.Labels_Table_LastPage',
        nextPage: 'Practices.Labels_Table_NextPage',
        previousPage: 'Practices.Labels_Table_PreviousPage',
        currentPage: 'Practices.Labels_Table_CurrentPage',
        totalPages: 'Practices.Labels_Table_TotalPage',
        of: 'Practices.Labels_Table_Of',
    };

    @Input()
    disableCurrentPageInput: boolean;

    /**
     * Page size
     */
    get pageSize(): number | string {
        return this.page.size;
    }

    @Input()
    set pageSize(size: number | string) {
        if (typeof size === 'number') {
            this.page.size = size as number;
        }
    }

    /**
     * Total items (needed to guess the last page)
     */
    get totalItems(): number | string {
        return this.page.totalItems;
    }

    @Input()
    set totalItems(total: number | string) {
        if (typeof total === 'number') {
            this.page.totalItems = total as number;
        }
    }

    /**
     * Last page
     */
    get lastPage(): number | string {
        return this.page.last;
    }

    @Input()
    set lastPage(last: number | string) {
        if (typeof last === 'number') {
            this.page.last = last as number;
        }
    }

    /**
     * Current page
     */
    get currentPage(): number | string {
        return this.page.current;
    }

    @Input()
    set currentPage(page: number | string) {
        if (typeof page === 'number') {
            this.page.current = page as number;
        }
    }

    @Input()
    showFirstAndLastPageButton = false;

    @Output() currentPageChange = new EventEmitter<number>(false);

    /*
     * Subscription to the Page service for page changes.
     * Note: this only emits after the datagrid is initialized/stabalized and the page changes.
     */
    ngOnInit() {
        // Hook up with view source
        const _tableViewSourceSub = this._table.tableViewSource$
            .pipe(
                switchMap((viewSource) =>
                    merge(
                        new Observable(() =>
                            combineLatest([
                                this.page.change.pipe(
                                    startWith(this.page.current),
                                    tap((page) => this._table.triggerInteractionEvent({ type: 'page', number: page })),
                                ),
                                this.page.sizeChange.pipe(
                                    startWith(this.page.size),
                                    tap((size) =>
                                        this._table.triggerInteractionEvent({ type: 'page-size', number: size }),
                                    ),
                                ),
                            ]).subscribe(([page, size]) => {
                                viewSource.page((page - 1) * size, size);
                            }),
                        ),
                        new Observable(() =>
                            viewSource.page$.subscribe((page) => {
                                this.page.totalItems = page.total;
                            }),
                        ),
                        new Observable(() =>
                            viewSource.queryParams$.subscribe((params) => {
                                if (!params || !params.take) {
                                    // Initially, the take param is always zero, as this is a invalid value, we ignore it.
                                    return;
                                }

                                // Update the ui, when the view source is programmatically changed
                                if (params.take !== this.page.size) {
                                    this.page.size = params.take;
                                }

                                if (
                                    params.skip !== undefined &&
                                    params.skip !== (this.page.current - 1) * this.page.size
                                ) {
                                    this.page.current = Math.floor((params.skip as number) / this.page.size) + 1;
                                }
                            }),
                        ),
                    ),
                ),
                takeUntil(this._destroy$),
            )
            .subscribe();

        /*
         * Default page size.
         * The reason we set it here and not in the provider itself is because
         * we don't want pagination if this component isn't present in the datagrid.
         */
        if (!this.page.size) {
            this.page.size = DEFAULT_PAGE_SIZE;
        }
        this._pageSubscription = this.page.change.subscribe((current) => this.currentPageChange.emit(current));
    }

    ngOnDestroy() {
        this.page.resetPageSize(true);
        if (this._pageSubscription) {
            this._pageSubscription.unsubscribe();
        }
    }

    /**
     * Moves to the previous page if it exists
     */
    previous() {
        this.page.previous();
    }

    /**
     * Moves to the next page if it exists
     */
    next() {
        this.page.next();
    }

    /**
     * Index of the first item displayed on the current page, starting at 0, -1 if none displayed
     */
    get firstItem(): number {
        return this.page.firstItem;
    }

    /**
     * Index of the last item displayed on the current page, starting at 0, -1 if none displayed
     */
    get lastItem(): number {
        return this.page.lastItem;
    }

    /**
     * Conditionally adds page numbers before and after the current page
     */
    get middlePages(): number[] {
        const middlePages: number[] = [];
        if (this.page.current > 1) {
            middlePages.push(this.page.current - 1);
        }
        middlePages.push(this.page.current);
        if (this.page.current < this.page.last) {
            middlePages.push(this.page.current + 1);
        }
        return middlePages;
    }

    /**
     * We only update the pagination's current page on blur of the input field, or
     * when they press enter.
     */
    updateCurrentPage(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        const parsed = target ? parseInt(target.value) : NaN;

        // if the input value, is not a number, we don't update the page
        if (!isNaN(parsed)) {
            if (parsed < 1) {
                this.page.current = 1;
            } else if (parsed > this.page.last) {
                this.page.current = this.page.last;
            } else {
                this.page.current = parsed;
            }
        }

        /**
         * Set the input's value to the new current page. This is needed because the code
         * above may have changed the value from what the user entered in.
         */
        this.currentPageInputRef.nativeElement.value = this.page.current;
    }
}

