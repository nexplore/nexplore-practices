import { Directive, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    map,
    merge,
    Observable,
    of,
    shareReplay,
    skip,
    switchMap,
    take,
    takeUntil,
} from 'rxjs';
import { setHostAttr } from '../util/utils';
import { SELECTION_CONFIG } from './selection.config';
import { PuibeSelectAllIndeterminateEvent, PuibeSelectionMode } from './types';

@Directive({
    selector: '[puibeSelectionMode], puibe-table[selectionMode], puibe-table[selectedItem], puibe-table[selectedItems]',
    standalone: true,
})
export class PuibeSelectionDirective implements OnDestroy {
    private readonly _config = inject(SELECTION_CONFIG, { optional: true });
    private readonly _selectionSubject = new BehaviorSubject<any[]>([]);
    private readonly _selectionModeSubject = new BehaviorSubject<PuibeSelectionMode>('single');
    private readonly _selectAllSubject = new BehaviorSubject<boolean | null>(null);
    private readonly _selectAllIndeterminateSubject = new BehaviorSubject<PuibeSelectAllIndeterminateEvent | null>(
        null
    );
    private readonly _selectedItemsChangeEmitter = new EventEmitter<any[]>();

    /**
     * The key used to compare items for selection.
     * This is used to determine if an item is already selected and especially important in scenarios where data is reloaded and new references are created.
     *
     * If a string is provided, the value of the property with the given name will be used.
     * If a function is provided, the return value of the function will be used.
     *
     * By default, the item itself will be used.
     *
     * Note: you can configure the default globally with `providePracticesKtbe`:
     * ```ts
     *  providePracticesKtbe({
     *      selection: {
     *          // Uses the `id` property of the item if available, otherwise the item itself.
     *          defaultSelectionComparisionKey: (item: any) => item?.id ?? item,
     *      }
     *  }),
     * ```
     */
    @Input()
    selectionComparisionKey: string | ((item: unknown) => unknown) =
        this._config?.defaultSelectionComparisionKey ?? ((item) => item);

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

    /**
     * Emits the current select-all state (`true` or `false`), as soon as all items were (de-)selected at least once.
     */
    readonly selectAll$ = this._selectAllSubject.pipe(filter((value) => value !== null));

    /**
     * @internal
     *
     * Emits only new select-all requests, without replaying the current state.
     */
    readonly selectAllRequest$ = this._selectAllSubject.pipe(
        skip(1),
        filter((value) => value !== null)
    );

    @Output()
    readonly selectedItemsChange: Observable<any[]> = this._selectedItemsChangeEmitter.pipe(debounceTime(1));

    @Output()
    readonly selectedItemChange: Observable<any> = this.selectedItemsChange.pipe(
        map((items) => (items ? items[0] : null))
    );

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

    /**
     * If `true`, all items are selected, if `false` all items are deselected.
     */
    @Input()
    set selectAll(value: boolean) {
        this._selectAllSubject.next(value);
    }

    get selectAll() {
        return this._selectAllSubject.value;
    }

    /**
     * Emits when the user (de-)selects all items.
     */
    @Output()
    readonly selectAllChange = new EventEmitter<boolean>();

    /**
     * Emits when the user changes the selection of single items after all items were (de-)selected.
     */
    @Output()
    readonly selectAllIndeterminate: Observable<PuibeSelectAllIndeterminateEvent> =
        this._selectAllIndeterminateSubject.pipe(filter((value) => value !== null));

    @Output()
    selectionChange = new EventEmitter<any>();

    @Output()
    puibeSelectionChange = this.selectionChange;

    toggleAll(selected: boolean) {
        this._selectionSubject.pipe(debounceTime(1), first()).subscribe((items) => {
            this._selectedItemsChangeEmitter.emit(items); // Emit change event to consumer
        });

        this._selectAllIndeterminateSubject.next(null);
        this._selectAllSubject.next(selected);
        this.selectAllChange.emit(selected);
        if (selected === false) {
            this._selectionSubject.next([]);
        }
    }

    toggle(item: any, requestSelect?: boolean, options?: { isByToggleAllRequest?: boolean }) {
        switch (this.selectionMode) {
            case 'single': {
                const itemKey = this.getSelectionComparisionKey(item);
                const selectedItemKey = this.getSelectionComparisionKey(this.selectedItem);
                requestSelect = requestSelect == null ? selectedItemKey !== itemKey : requestSelect;
                if (requestSelect) {
                    this.selectedItem = item;
                } else {
                    this.selectedItem = null;
                }
                break;
            }
            case 'multi': {
                let selection = this._selectionSubject.value;
                const existingIndex = this.findItemIndex(item);
                if (requestSelect == null) {
                    // Deselect if it was selected, otherwise select it
                    // (if all items were selected, an item that is not part of the selection must be deselected)
                    requestSelect = existingIndex !== -1 ? false : this._selectAllSubject.value !== true;
                }

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

        if (!options?.isByToggleAllRequest) {
            if (this._selectAllSubject.value != null) {
                if (this._selectAllSubject.value && !requestSelect) {
                    this._selectAllIndeterminateSubject.next({
                        allSelectedExcept: [
                            ...(this._selectAllIndeterminateSubject.value?.allSelectedExcept ?? []),
                            item,
                        ],
                    });
                } else if (!this._selectAllSubject.value && requestSelect) {
                    this._selectAllIndeterminateSubject.next({
                        allDeselectedExcept: this._selectionSubject.value,
                    });
                }
            }

            this._selectedItemsChangeEmitter.emit(this._selectionSubject.value);
        }
    }

    ngOnDestroy(): void {
        this._selectionSubject.complete();
        this._selectionModeSubject.complete();
        this._selectAllSubject.complete();
        this._selectAllIndeterminateSubject.complete();
    }

    getSelectionComparisionKey(item: unknown): unknown {
        if (typeof this.selectionComparisionKey === 'function') {
            return this.selectionComparisionKey(item);
        }

        return item != null && typeof item === 'object' ? (item as any)[this.selectionComparisionKey] ?? item : item;
    }

    findItemIndex(item: unknown) {
        const itemKey = this.getSelectionComparisionKey(item);
        return this.selectedItems.findIndex(
            (selectedItem) => this.getSelectionComparisionKey(selectedItem) === itemKey
        );
    }

    hasSelectedItem(item: unknown) {
        return this.findItemIndex(item) !== -1;
    }

    /** @internal */
    onItemRemovedFromView(item: unknown) {
        if (this.selectionMode === 'multi' && this._selectAllSubject.value) {
            const index = this.findItemIndex(item);
            if (index !== -1) {
                const newSelection = [...this._selectionSubject.value];
                newSelection.splice(index, 1);
                this._selectionSubject.next(newSelection); // Update selection internally
                this._selectedItemsChangeEmitter.emit(newSelection); // Emit change event to consumer
            }
        }
    }

    /** @internal */
    onItemAddedToView(item: unknown) {
        if (this.selectionMode === 'multi' && !this.hasSelectedItem(item)) {
            const newSelection = [...this._selectionSubject.value, item];
            this._selectionSubject.next(newSelection); // Update selection internally
            this._selectedItemsChangeEmitter.emit(newSelection); // Emit change event to consumer
        }
    }
}

let nextGlobalId = 0;

@Directive({
    selector: '[puibeSelectable], puibe-table-row[selectable]',
    standalone: true,
    providers: [DestroyService],
})
export class PuibeSelectableDirective implements OnInit {
    private readonly _selectableSubject = new BehaviorSubject<boolean | any>(false);
    private readonly _nonFocusableSubject = new BehaviorSubject<boolean | null>(null);
    private readonly _nonFocusableDefaultSubject = new BehaviorSubject<boolean | null>(null);
    private _hasIsSelectedChangedByInput = false;

    // Fallback used when no model is assigned to the `selectable` binding
    private readonly _fallbackModel = '_selectable-global-id-' + nextGlobalId++;

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

    readonly nonFocusable$ = combineLatest([this._nonFocusableSubject, this._nonFocusableDefaultSubject]).pipe(
        map(([nonFocusable, defaultValue]) => nonFocusable ?? defaultValue),
        takeUntil(this._destroy$)
    );

    readonly selected$ = this.selectable$.pipe(
        switchMap((selectable) =>
            selectable
                ? this._selection.selectedItems$.pipe(
                      map((items) => this._isIncludedIn(items)),
                      distinctUntilChanged(),
                      switchMap((selected) =>
                          merge(
                              of(selected),
                              // select-all can be requested by the table, it takes precedence until overridden by the user.
                              // Only `true` values are relevant, because deselection is already handled by `selectedItems$`
                              this._selection.selectAll$.pipe(filter((selectAll) => selectAll)),
                              this._selection.selectAllIndeterminate.pipe(
                                  map((event) =>
                                      event.allSelectedExcept ? !this._isIncludedIn(event.allSelectedExcept) : selected
                                  )
                              )
                          )
                      )
                  )
                : of(false)
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
        debounceTime(1), // Debounce, so only the latest value is emitted
        takeUntil(this._destroy$)
    );

    readonly selectionMode$ = this._selection.selectionMode$.pipe(takeUntil(this._destroy$));

    /**
     * Allows to (de-)select the item, e.g. with a two-way binding `[(isSelected)]`.
     */
    @Input()
    set isSelected(value: boolean) {
        this._hasIsSelectedChangedByInput = true;
        this.selected$.pipe(take(1)).subscribe((selected) => {
            if (selected !== value) {
                this.toggle(value);
            }
            this._hasIsSelectedChangedByInput = false;
        });
    }

    @Output()
    readonly isSelectedChange = this.selected$.pipe(filter(() => !this._hasIsSelectedChangedByInput));

    /**
     * If `true`, the selectable element is not focusable (no `tabindex` is set).
     */
    @Input()
    set nonFocusable(val: boolean) {
        this._nonFocusableSubject.next(val);
    }

    get nonFocusable() {
        return this._nonFocusableSubject.value;
    }

    get selectionMode() {
        return this._selection.selectionMode;
    }

    /**
     * @deprecated Use `getSelectableModel()`
     */
    get selectableModel() {
        return this.getSelectableModel();
    }

    constructor(
        private _selection: PuibeSelectionDirective,
        private _destroy$: DestroyService,
        private _elementRef: ElementRef<HTMLElement>
    ) {}

    ngOnInit() {
        this._selection.selectAllRequest$.pipe(takeUntil(this._destroy$)).subscribe((selectAll) => {
            if (selectAll === true && this.selectable) {
                // Make sure the item is added to the selected items
                this._selection.toggle(this.getSelectableModel(), true, { isByToggleAllRequest: true });
            }
        });

        combineLatest([this.selectable$, this.nonFocusable$]).subscribe(([selectable, nonFocusable]) => {
            this._applyTabindex(selectable, nonFocusable);
        });

        this.selected$.subscribe((selected) => {
            setHostAttr('aria-selected', selected ? 'true' : this.selectable ? 'false' : null, this._elementRef);
        });

        this.selected$.pipe(first()).subscribe((selected) => {
            if (selected) {
                this._selection.onItemAddedToView(this.getSelectableModel());
            }
        });

        this._destroy$.subscribe(() => {
            // Make sure the item is removed from the selected items, if it is no longer in the view
            this._selection.onItemRemovedFromView(this.getSelectableModel());
        });
    }

    /**
     * @internal
     *
     * Used by other selection directives to set the default value for `nonFocusable`.
     */
    setDefaultNonFocusable(val: boolean) {
        this._nonFocusableDefaultSubject.next(val);
    }

    /**
     * Toggle the selection of the item.
     *
     * @param select If true, the item will be selected. If false, the item will be deselected. If not specified, the item will be toggled.
     */
    toggle(select?: boolean) {
        this._selection.toggle(this.getSelectableModel(), select);
    }

    getComparisionKey() {
        return this._selection.getSelectionComparisionKey(this.getSelectableModel());
    }

    getSelectableModel() {
        return typeof this.selectable === 'boolean' ? this._fallbackModel : this.selectable;
    }

    private _isIncludedIn(items: unknown[]): boolean {
        const key = this.getComparisionKey();
        return items.some((item) => key === this._selection.getSelectionComparisionKey(item));
    }

    private _applyTabindex(selectable: boolean, nonFocusable: boolean) {
        const tabindex = this._elementRef.nativeElement.getAttribute('tabindex');

        // Do not override a custom tabindex
        if (tabindex && tabindex !== '0') {
            return;
        }

        setHostAttr('tabindex', !selectable || nonFocusable ? null : '0', this._elementRef);
    }
}
