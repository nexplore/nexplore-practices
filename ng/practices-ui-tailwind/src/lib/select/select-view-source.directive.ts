import { AfterViewInit, ChangeDetectorRef, Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DestroyService, StatusProgressOptions, StatusService } from '@nexplore/practices-ui';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BehaviorSubject, combineLatest, filter, map, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { SelectViewSource } from './select-view-source';
import { PuiSelectDirective } from './select.directive';

@Directive({
    standalone: true,
    selector: 'ng-select[puiSelectViewSource]',
    providers: [DestroyService],
})
export class PuiSelectViewSourceDirective<T = unknown> implements OnInit, OnDestroy, AfterViewInit {
    private _ngSelectComponent = inject(NgSelectComponent, { self: true });
    private _selectDirective = inject(PuiSelectDirective, { self: true, optional: true });
    private _formFieldService = inject(FormFieldService);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _destroy$ = inject(DestroyService);
    private _statusService = inject(StatusService);

    private _selectViewSourceSubject = new BehaviorSubject<SelectViewSource<T> | null>(null);
    private _selectViewSource$ = this._selectViewSourceSubject.pipe(filter((s): s is SelectViewSource<T> => s != null));
    private _busy$ = this._selectViewSource$.pipe(switchMap((viewSource) => viewSource.busy$));
    private _data$ = this._selectViewSource$.pipe(switchMap((viewSource) => viewSource.pageData$));

    private _searchInputSubject = new Subject<string>();

    @Input('puiSelectViewSource')
    set selectViewSource(value: SelectViewSource<T>) {
        this._selectViewSourceSubject.next(this._statusService.registerListViewSource(value, this.statusOptions));
    }
    get selectViewSource() {
        return this._selectViewSourceSubject.value;
    }

    /**
     * Options for the status service, specifiying how `selectViewSource` is registered.
     *
     * By default, the status service will register the select view source with the `silent` option set to true, so it will not show a global loading message.
     */
    @Input()
    statusOptions: StatusProgressOptions = { silent: true };

    @Input()
    set bindLabel(value: string) {
        if (this.selectViewSource != null) {
            (this.selectViewSource as any).label = value;
        }
    }

    @Input()
    set bindValue(value: string) {
        if (this.selectViewSource != null) {
            (this.selectViewSource as any).value = value;
        }
    }

    @Input()
    set searchable(value: boolean) {
        if (this.selectViewSource != null) {
            this.selectViewSource.searchable = value;
            this.setSearchMode(this.selectViewSource.searchable, this.selectViewSource.localSearch);
        }
    }

    constructor() {
        this._ngSelectComponent.items = []; // force ng-select to use items instead of ngOptions
    }

    ngOnInit() {
        const _subSelectViewSource$ = this._selectViewSource$
            .pipe(takeUntil(this._destroy$))
            .subscribe((viewSource) => {
                if ((viewSource as any).label != null && typeof (viewSource as any).label === 'string') {
                    this._ngSelectComponent.bindLabel = (viewSource as any).label;
                } else {
                    (viewSource as any).label = this._ngSelectComponent.bindLabel;
                }

                if ((viewSource as any).value != null && typeof (viewSource as any).value === 'string') {
                    this._ngSelectComponent.bindValue = (viewSource as any).value;
                } else {
                    (viewSource as any).value = this._ngSelectComponent.bindValue;
                }

                if (viewSource.searchable != null) {
                    this._ngSelectComponent.searchable = viewSource.searchable;
                } else {
                    viewSource.searchable = this._ngSelectComponent.searchable;
                }

                this.setSearchMode(viewSource.searchable, viewSource.localSearch);
            });

        const _subBusy$ = this._busy$.pipe(takeUntil(this._destroy$)).subscribe((busy) => {
            this._ngSelectComponent.loading = busy;
            if (this._ngSelectComponent.isOpen) {
                this._formFieldService.setLoading(busy);
            } else {
                this._formFieldService.setLoading(false);
            }
        });

        const _subData$ = this._data$.pipe(takeUntil(this._destroy$)).subscribe((data) => {
            this._ngSelectComponent.items = data;

            // This is a dangerous hack because it relies on the internals of ng-select
            // It is necessary because angular does not call ngOnChanges when we set properties manually and ng-select uses this to detect changes of items.
            this._ngSelectComponent.ngOnChanges({ items: { currentValue: data } } as any);
            this._changeDetectorRef.markForCheck();
        });

        const _subSearch$ = combineLatest([this._searchInputSubject, this._selectViewSource$])
            .pipe(
                filter(([_, viewSource]) => !!viewSource.searchable && !viewSource.localSearch),
                takeUntil(this._destroy$),
            )
            .subscribe(([searchInput, viewSource]) => {
                const labelKey = this._ngSelectComponent.bindLabel ?? (viewSource as any).label ?? 'label';
                (viewSource as any).filter({ [labelKey]: searchInput });
            });
    }

    ngAfterViewInit(): void {
        if (this._selectDirective) {
            // Override readonly value function to provide a stream of updated data
            this._formFieldService.setReadonlyValueFunction(() =>
                this._data$.pipe(
                    map(() => this._selectDirective.getReadOnlyValue()),
                    startWith(this._selectDirective.getReadOnlyValue()),
                ),
            );
        }
    }

    ngOnDestroy() {
        this._selectViewSourceSubject.complete();
        this._searchInputSubject.complete();
    }

    private setSearchMode(searchable: boolean | undefined, localSearch: boolean | undefined) {
        if (searchable && !localSearch && !this._ngSelectComponent.typeahead) {
            this._ngSelectComponent.typeahead = this._searchInputSubject;
        } else if (this._ngSelectComponent.typeahead === this._searchInputSubject) {
            this._ngSelectComponent.typeahead = null;
        }
    }
}

