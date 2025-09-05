import { AfterViewInit, ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { DestroyService, StatusProgressOptions, StatusService } from '@nexplore/practices-ui';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BehaviorSubject, combineLatest, filter, map, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { SelectViewSource } from './select-view-source';
import { PuibeSelectDirective } from './select.directive';

@Directive({
    standalone: true,
    selector: 'ng-select[puibeSelectViewSource]',
    providers: [DestroyService],
})
export class PuibeSelectViewSourceDirective implements OnInit, OnDestroy, AfterViewInit {
    private _selectViewSourceSubject = new BehaviorSubject<SelectViewSource<any>>(null);
    private _selectViewSource$ = this._selectViewSourceSubject.pipe(filter((s) => s != null));
    private _busy$ = this._selectViewSource$.pipe(switchMap((viewSource) => viewSource.busy$));
    private _data$ = this._selectViewSource$.pipe(switchMap((viewSource) => viewSource.pageData$));

    private _searchInputSubject = new Subject<string>();

    @Input('puibeSelectViewSource')
    set selectViewSource(value: SelectViewSource<any>) {
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
            this.selectViewSource.label = value;
        }
    }

    @Input()
    set bindValue(value: string) {
        if (this.selectViewSource != null) {
            this.selectViewSource.value = value;
        }
    }

    @Input()
    set searchable(value: boolean) {
        if (this.selectViewSource != null) {
            this.selectViewSource.searchable = value;
            this.setSearchMode(this.selectViewSource.searchable, this.selectViewSource.localSearch);
        }
    }

    constructor(
        @Self() private _ngSelectComponent: NgSelectComponent,
        @Self() @Optional() private _selectDirective: PuibeSelectDirective,
        private _formFieldService: FormFieldService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _destroy$: DestroyService,
        private _statusService: StatusService
    ) {
        this._ngSelectComponent.items = []; // force ng-select to use items instead of ngOptions
    }

    ngOnInit() {
        this._selectViewSource$.pipe(takeUntil(this._destroy$)).subscribe((viewSource) => {
            if (viewSource.label != null && typeof viewSource.label === 'string') {
                this._ngSelectComponent.bindLabel = viewSource.label;
            } else {
                viewSource.label = this._ngSelectComponent.bindLabel;
            }

            if (viewSource.value != null && typeof viewSource.value === 'string') {
                this._ngSelectComponent.bindValue = viewSource.value;
            } else {
                viewSource.value = this._ngSelectComponent.bindValue;
            }

            if (viewSource.searchable != null) {
                this._ngSelectComponent.searchable = viewSource.searchable;
            } else {
                viewSource.searchable = this._ngSelectComponent.searchable;
            }

            this.setSearchMode(viewSource.searchable, viewSource.localSearch);
        });

        this._busy$.pipe(takeUntil(this._destroy$)).subscribe((busy) => {
            this._ngSelectComponent.loading = busy;
            if (this._ngSelectComponent.isOpen) {
                this._formFieldService.setLoading(busy);
            } else {
                this._formFieldService.setLoading(false);
            }
        });

        this._data$.pipe(takeUntil(this._destroy$)).subscribe((data) => {
            this._ngSelectComponent.items = data;

            // This is a dangerous hack because it relies on the internals of ng-select
            // It is necessary because angular does not call ngOnChanges when we set properties manually and ng-select uses this to detect changes of items.
            this._ngSelectComponent.ngOnChanges({ items: { currentValue: data } } as any);
            this._changeDetectorRef.markForCheck();
        });

        combineLatest([this._searchInputSubject, this._selectViewSource$])
            .pipe(
                filter(([_, viewSource]) => viewSource.searchable && !viewSource.localSearch),
                takeUntil(this._destroy$)
            )
            .subscribe(([searchInput, viewSource]) =>
                viewSource.filter({
                    [this._ngSelectComponent.bindLabel ?? viewSource.label ?? 'label']: searchInput,
                })
            );
    }

    ngAfterViewInit(): void {
        if (this._selectDirective) {
            // Override readonly value function to provide a stream of updated data
            this._formFieldService.setReadonlyValueFunction(() =>
                this._data$.pipe(
                    map(() => this._selectDirective.getReadOnlyValue()),
                    startWith(this._selectDirective.getReadOnlyValue())
                )
            );
        }
    }

    ngOnDestroy() {
        this._selectViewSourceSubject.complete();
        this._searchInputSubject.complete();
    }

    private setSearchMode(searchable: boolean, localSearch: boolean) {
        if (searchable && !localSearch && !this._ngSelectComponent.typeahead) {
            this._ngSelectComponent.typeahead = this._searchInputSubject;
        } else if (this._ngSelectComponent.typeahead === this._searchInputSubject) {
            this._ngSelectComponent.typeahead = null;
        }
    }
}
