import { Directive, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { BehaviorSubject, distinctUntilChanged, map, skip, takeUntil } from 'rxjs';
import { PuibeSelectionMode } from './types';

@Directive({
    selector: '[puibeSelectionMode], puibe-table[selectionMode], puibe-table[selectedItem], puibe-table[selectedItems]',
    standalone: true,
})
export class PuibeSelectionDirective implements OnDestroy {
    private _selectionSubject = new BehaviorSubject<any[]>([]);
    private _selectionModeSubject = new BehaviorSubject<PuibeSelectionMode>('single');

    @Input()
    set selectedItem(val: any) {
        this._selectionSubject.next(val instanceof Array ? val : [val]);
    }

    get selectedItem() {
        return this._selectionSubject.value[0];
    }

    @Input()
    set selectedItems(val: any[]) {
        this._selectionSubject.next(val instanceof Array ? val : val == null ? [] : [val]);
    }

    get selectedItems() {
        return this._selectionSubject.value;
    }

    readonly selectedItem$ = this._selectionSubject.pipe(map((s) => s[0]));

    readonly selectedItems$ = this._selectionSubject.asObservable();

    @Output()
    readonly selectedItemChange = this.selectedItem$.pipe(skip(1));

    @Output()
    readonly selectedItemsChange = this.selectedItems$.pipe(skip(1));

    @Input()
    set puibeSelectionMode(val: PuibeSelectionMode) {
        this.selectionMode = val;
    }

    @Input()
    set selectionMode(val: PuibeSelectionMode) {
        this._selectionModeSubject.next(val);
    }

    get selectionMode() {
        return this._selectionModeSubject.value;
    }

    readonly selectionMode$ = this._selectionModeSubject.asObservable();

    @Output()
    selectionChange = new EventEmitter<any>();

    @Output()
    puibeSelectionChange = this.selectionChange;

    @Output()
    selectAll = new EventEmitter<boolean>();

    toggleAll(selected: boolean) {
        this.selectAll.emit(selected);
    }

    toggle(item: any, requestSelect?: boolean) {
        switch (this.selectionMode) {
            case 'single': {
                requestSelect = requestSelect == null ? this.selectedItem !== item : requestSelect;
                if (requestSelect) {
                    this.selectedItem = item;
                } else {
                    this.selectedItem = null;
                }
                break;
            }
            case 'multi': {
                let selection = this._selectionSubject.value;
                const existingIndex = selection.indexOf(item);
                if (existingIndex !== -1) {
                    if (requestSelect === false) {
                        const newSelection = [...selection];
                        newSelection.splice(existingIndex, 1);
                        selection = newSelection;
                    }
                } else if (requestSelect !== false) {
                    selection = [...selection, item];
                }

                this.selectedItems = selection;
                break;
            }
        }
    }

    ngOnDestroy(): void {
        this._selectionSubject.complete();
        this._selectionModeSubject.complete();
    }
}

@Directive({
    selector: '[puibeSelectable], puibe-table-row[selectable]',
    standalone: true,
    providers: [DestroyService],
})
export class PuibeSelectableDirective {
    private _selection = inject(PuibeSelectionDirective);
    private _destroy$ = inject(DestroyService);

    private _selectableSubject = new BehaviorSubject<boolean | any>(false);
    @Input()
    set puibeSelectable(val: boolean | any) {
        this._selectableSubject.next(val);
    }

    @Input()
    set selectable(val: boolean | any) {
        this._selectableSubject.next(val);
    }

    get selectable() {
        return this._selectableSubject.value;
    }

    readonly selectable$ = this._selectableSubject.pipe(takeUntil(this._destroy$));

    // Fallback used when no model is assigned to the `selectable` binding
    private _fallbackModel = {};

    readonly selected$ = this._selection.selectedItems$.pipe(
        map((items) => this.selectable && items.includes(this.selectableModel)),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
    );

    readonly selectionMode$ = this._selection.selectionMode$.pipe(takeUntil(this._destroy$));

    get selectionMode() {
        return this._selection.selectionMode;
    }

    constructor() {
        this._selection.selectAll.pipe(takeUntil(this._destroy$)).subscribe((selectAll) => {
            this.toggle(selectAll);
        });
    }

    toggle(select?: boolean) {
        this._selection.toggle(this.selectableModel, select);
    }

    get selectableModel() {
        return this.selectable === true ? this._fallbackModel : this.selectable;
    }
}
