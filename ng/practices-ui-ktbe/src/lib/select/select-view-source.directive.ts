import { AfterViewInit, ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
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
        // This is a dangerous hack because it relies on the internals of ng-select. Prevents ng-select from trying to override items from ng-options
        (this._ngSelectComponent as any)['_itemsAreUsed'] = true;
        
        this._writeComponentProp('items', []);
    }

    ngOnInit() {
        this._selectViewSource$.pipe(takeUntil(this._destroy$)).subscribe((viewSource) => {
            // bindLabel
            if (viewSource.label != null && typeof viewSource.label === 'string') {
                this._writeComponentProp('bindLabel', viewSource.label);
            } else {
                const current = this._readComponentProp<string | undefined>('bindLabel');
                viewSource.label = current ?? viewSource.label;
            }

            // bindValue
            if (viewSource.value != null && typeof viewSource.value === 'string') {
                this._writeComponentProp('bindValue', viewSource.value);
            } else {
                const current = this._readComponentProp<string | undefined>('bindValue');
                viewSource.value = current ?? viewSource.value;
            }

            // searchable
            if (viewSource.searchable != null) {
                this._writeComponentProp('searchable', viewSource.searchable);
            } else {
                const current = this._readComponentProp<boolean | undefined>('searchable');
                viewSource.searchable = current ?? viewSource.searchable;
            }

            this.setSearchMode(viewSource.searchable, viewSource.localSearch);
        });

        this._busy$.pipe(takeUntil(this._destroy$)).subscribe((busy) => {
            this._writeComponentProp('loading', busy);
            const isOpen = this._readComponentProp<boolean>('isOpen');
            if (isOpen) {
                this._formFieldService.setLoading(busy);
            } else {
                this._formFieldService.setLoading(false);
            }
        });

        this._data$.pipe(takeUntil(this._destroy$)).subscribe((data) => {
            this._writeComponentProp('items', data);

            // This is a dangerous hack because it relies on the internals of ng-select
            // It is necessary because angular does not call ngOnChanges when we set properties manually and ng-select uses this to detect changes of items.
            try {
                (this._ngSelectComponent as any).ngOnChanges({ items: { currentValue: data } } as any);
            } catch {
                // ignore if ngOnChanges is not present on older/newer versions
            }
            this._changeDetectorRef.markForCheck();
        });

        combineLatest([this._searchInputSubject, this._selectViewSource$])
            .pipe(
                filter(([_, viewSource]) => viewSource.searchable && !viewSource.localSearch),
                takeUntil(this._destroy$)
            )
            .subscribe(([searchInput, viewSource]) =>
                viewSource.filter({
                    [this._readComponentProp<string | undefined>('bindLabel') ?? viewSource.label ?? 'label']: searchInput,
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

    // Helper to read a property from the ng-select component that may be a plain value or a signal/function
    private _readComponentProp<T = any>(prop: string): T {
        const p = (this._ngSelectComponent as any)[prop];
        if (typeof p === 'function') {
            return p();
        }

        return p;
    }

    // Helper to write a property to the ng-select component that may accept direct assignment or a signal `.set()` method
    private _writeComponentProp(prop: string, value: any): void {
        const p = (this._ngSelectComponent as any)[prop];
        if (p != null && typeof p.set === 'function') {
            p.set(value);
            return;
        }

        // This is a dangerous hack relying on Angular signals internals and is only a temporary solution until ng-select supports writable signals
        if (typeof p === 'function' && (p as any)[SIGNAL] != null) {
            signalSetFn((p as any)[SIGNAL], value);
            return;
        }
        
        (this._ngSelectComponent as any)[prop] = value;
    }

    private setSearchMode(searchable: boolean, localSearch: boolean) {
        const currentTypeahead = this._readComponentProp<any>('typeahead');
        if (searchable && !localSearch && !currentTypeahead) {
            this._writeComponentProp('typeahead', this._searchInputSubject);
        } else if (currentTypeahead === this._searchInputSubject) {
            this._writeComponentProp('typeahead', null);
        }
    }
}
