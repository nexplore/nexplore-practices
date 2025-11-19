import { AsyncPipe, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map, takeUntil, tap } from 'rxjs';
import { PuibeIconSpinnerComponent } from '../../icons/icon-spinner.component';
import { DEFAULT_PAGE_SIZE } from '../pagination/config';
import { PuibeTableComponent } from '../table.component';

@Component({
    standalone: true,
    selector: 'puibe-table-pagination-infinite-scroll',
    templateUrl: './table-pagination-infinite-scroll.component.html',
    imports: [NgIf, AsyncPipe, TranslateModule, PuibeIconSpinnerComponent],
    providers: [DestroyService],
})
export class PuibeTablePaginationInfiniteScrollComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    pageSize: number = DEFAULT_PAGE_SIZE;

    private _totalCount = 0;

    @ViewChild('scrollingAnchor')
    private _marker!: ElementRef<HTMLSpanElement>;

    private _observer: IntersectionObserver; // will trigger reload on the end of the page
    private _intersectionSubject = new BehaviorSubject<boolean>(false);
    private _currentDataLength = 0;

    private busySubject = new BehaviorSubject(true);
    private busyCountSubject = new BehaviorSubject(0);
    private hasMoreDataSubject = new BehaviorSubject(true);
    private hasPagedOnceSubject = new BehaviorSubject(false);

    readonly busy$ = this.busySubject.asObservable();
    readonly busyCount$ = this.busyCountSubject.asObservable();
    readonly noMoreData$ = combineLatest([this.hasMoreDataSubject, this.hasPagedOnceSubject]).pipe(
        map(([hasMoreData, hasPagedOnce]) => hasPagedOnce && !hasMoreData)
    );

    readonly tableNoItems$ = this._table.noItems$;

    constructor(private _table: PuibeTableComponent, private _destroy$: DestroyService) {}

    ngOnInit() {
        // Hook up with view source -> to reset prefetched in case the params get updated.
        this._table.tableViewSource.page$.pipe(takeUntil(this._destroy$)).subscribe((page) => {
            this._totalCount = page.total;
            this._currentDataLength = page.data.length;
            if (this._currentDataLength < this._totalCount) {
                this.loadNextPage();
                this.hasPagedOnceSubject.next(true);
            } else {
                this.busySubject.next(false);
                this.busyCountSubject.next(this.busyCountSubject.value - 1);
            }
        });

        // register Observer
        this._observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                this._intersectionSubject.next(true);
            } else {
                this._intersectionSubject.next(false);
            }
        });

        combineLatest([this._intersectionSubject, this.busySubject])
            .pipe(
                tap(([isIntesecting, isBusy]) => {
                    if (isIntesecting && !isBusy && this.hasMoreDataSubject.value) {
                        if (this._currentDataLength < this._totalCount) {
                            this._currentDataLength += this.pageSize;
                            this.loadNextPage();
                        }
                    }
                }),
                takeUntil(this._destroy$)
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        this._observer.observe(this._marker.nativeElement);
    }

    ngOnDestroy(): void {
        this._observer.disconnect();
    }

    private loadNextPage() {
        this.busySubject.next(true);
        this.busyCountSubject.next(this.busyCountSubject.value + 1);
        const skip = this._currentDataLength;
        const take = this.pageSize;
        const isLastFetch = skip + take >= this._totalCount;

        if (isLastFetch) {
            this.hasMoreDataSubject.next(false);
        } else {
            this.hasMoreDataSubject.next(true);
        }

        this._table.tableViewSource.prefetchNextPage(skip, take, isLastFetch).subscribe(() => {
            this.busySubject.next(false);
            this.busyCountSubject.next(this.busyCountSubject.value - 1);
        });
    }
}
