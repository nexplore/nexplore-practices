import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { PuibeCheckboxComponent } from '../checkbox/checkbox.component';
import { PuibeTableComponent } from '../table/table.component';
import { setHostAttr, setHostClassNames } from '../util/utils';
import { PuibeSelectableDirective, PuibeSelectionDirective } from './selection.directive';

/**
 * Checkbox displayed in the selection column of a table: in the header, it (de-)selects all items, in a row, it (de-)selects the row.
 */
@Component({
    selector: 'puibe-table-selection-checkbox',
    template: `<puibe-checkbox
        class="px-3"
        [ngModel]="checked$ | async"
        [inline]="true"
        (ngModelChange)="onChange($event)"
        [title]="selectLabelKey | translate"
        [tabIndex]="(isRowClickable$ | async) ? -1 : null"
    ></puibe-checkbox>`,
    imports: [FormsModule, AsyncPipe, TranslateModule, PuibeCheckboxComponent],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTableSelectionCheckboxComponent {
    private readonly _selectableRow = inject(PuibeSelectableDirective, { optional: true });
    private readonly _selectionRoot = inject(PuibeSelectionDirective);
    private readonly _tableSelection = inject(PuibeTableSelectionDirective);

    readonly checked$ = this._selectableRow?.selected$ ?? this._selectionRoot.selectAll$;

    readonly isRowClickable$ = this._tableSelection.useClickableRows$;

    get isSelectAll() {
        return !this._selectableRow;
    }

    get selectLabelKey() {
        return this.isSelectAll ? 'Practices.Labels_Table_SelectAll' : 'Practices.Labels_Table_SelectRow';
    }

    onChange(checked: boolean) {
        if (this.isSelectAll) {
            this._selectionRoot.toggleAll(checked);
        } else {
            this._selectableRow.toggle(checked);
        }
    }
}

@Directive({
    selector:
        'puibe-table[puibeSelectionMode], puibe-table[selectionMode], puibe-table[showCheckboxes], puibe-table[selectedItem], puibe-table[selectedItems]',
    standalone: true,
})
export class PuibeTableSelectionDirective {
    private readonly _showCheckboxesSubject = new BehaviorSubject<boolean | null>(null);
    private readonly _useClickableRowsSubject = new BehaviorSubject<boolean | null>(null);
    private readonly _disableSelectAllSubject = new BehaviorSubject<boolean>(false);

    /**
     * If `true`, displays a checkbox column in the table rows, representing the selection state.
     *
     * Note: If `selectionMode` is set to `multi`, this property is `true` by default.
     *
     * If `useClickableRows` is also set to `true`, the checkbox will be checked/unchecked by clicking on the row.
     */
    @Input()
    set showCheckboxes(value: boolean) {
        this._showCheckboxesSubject.next(value);
    }

    get showCheckboxes() {
        return this._isCheckboxSelectionActivated(this._selection.selectionMode, this._showCheckboxesSubject.value);
    }

    /**
     * If `true`, the table rows will be selectable by clicking on them (or pressing enter or space).
     *
     * The rows will also be focusable and display a hover style.
     *
     * Note: Defaults to `true` if no checkboxes are displayed.
     */
    @Input()
    set useClickableRows(value: boolean) {
        this._useClickableRowsSubject.next(value);
    }

    get useClickableRows() {
        return this._isClickableRowsActivated(
            this._selection.selectionMode,
            this._useClickableRowsSubject.value,
            this.showCheckboxes
        );
    }

    /**
     * Disables the select-all checkbox in the header (Only applies if `selectionMode` is `multi`).
     */
    @Input()
    set disableSelectAll(value: boolean) {
        this._disableSelectAllSubject.next(value);
    }

    get disableSelectAll() {
        return this._disableSelectAllSubject.value;
    }

    readonly showCheckboxes$ = combineLatest([this._showCheckboxesSubject, this._selection.selectionMode$]).pipe(
        map(([showCheckboxes, selectionMode]) => this._isCheckboxSelectionActivated(selectionMode, showCheckboxes))
    );

    readonly useClickableRows$ = combineLatest([
        this._useClickableRowsSubject,
        this.showCheckboxes$,
        this._selection.selectionMode$,
    ]).pipe(
        map(([useClickableRows, showCheckboxes, selectionMode]) =>
            this._isClickableRowsActivated(selectionMode, useClickableRows, showCheckboxes)
        )
    );

    constructor(
        table: PuibeTableComponent,
        private _selection: PuibeSelectionDirective,
        private _elementRef: ElementRef<HTMLElement>
    ) {
        combineLatest([_selection.selectionMode$, this.showCheckboxes$, this._disableSelectAllSubject]).subscribe(
            ([selectionMode, isCheckboxSelectionActivated, disableSelectAll]) => {
                const isMulti = selectionMode === 'multi';
                if (isCheckboxSelectionActivated) {
                    table.beforeColumnTemplate = {
                        componentType: PuibeTableSelectionCheckboxComponent,
                        noPadding: true,
                        hideInHeader: disableSelectAll || !isMulti,
                    };
                } else {
                    table.beforeColumnTemplate = null;
                }

                // Selected rows (`aria-selected`) are only supported by the grid role
                if (table.role === 'table' || table.role === 'grid') {
                    table.role = selectionMode === 'disabled' ? 'table' : 'grid';
                }

                setHostAttr('aria-multiselectable', isMulti ? 'true' : null, this._elementRef);
            }
        );
    }

    private _isClickableRowsActivated(
        selectionMode: string,
        useClickableRows: boolean | null,
        showCheckboxes: boolean
    ): boolean {
        return selectionMode !== 'disabled' && (useClickableRows ?? !showCheckboxes);
    }

    private _isCheckboxSelectionActivated(selectionMode: string, showCheckboxes: boolean | null): boolean {
        return selectionMode !== 'disabled' && (showCheckboxes ?? selectionMode === 'multi');
    }
}

@Directive({
    selector: 'puibe-table-row[puibeSelectable], puibe-table-row[selectable]',
    standalone: true,
})
export class PuibeTableSelectableDirective {
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        if ((event?.target as HTMLElement)?.closest?.('puibe-table-selection-checkbox')) {
            // The selection checkbox handles the click itself
            return;
        }

        this._toggleIfClickable();
    }

    @HostListener('keydown.enter', ['$event'])
    @HostListener('keydown.space', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if (event.target !== this._elementRef.nativeElement) {
            // Ignore key events of focusable children (e.g. buttons in a cell)
            return;
        }

        if (this._toggleIfClickable()) {
            event.preventDefault(); // Prevents scrolling on space
        }
    }

    constructor(
        private _host: PuibeSelectableDirective,
        private _tableSelection: PuibeTableSelectionDirective,
        private _elementRef: ElementRef<HTMLElement>,
        private _translate: TranslateService
    ) {
        combineLatest([this._host.selected$, this._host.selectable$, this._tableSelection.useClickableRows$]).subscribe(
            ([isSelected, isSelectable, useClickableRows]) => {
                setHostClassNames(
                    {
                        ['transition-all duration-200 cursor-pointer active:scale-x-95']:
                            isSelectable && useClickableRows,
                        ['hover:bg-light-sand']: !isSelected && isSelectable && useClickableRows,
                        ['hover:bg-sand-hover']: isSelected && isSelectable && useClickableRows,

                        ['bg-dark-sand']: isSelected && useClickableRows,
                    },
                    this._elementRef
                );

                _host.setDefaultNonFocusable(!useClickableRows);

                const title = this._translate.instant('Practices.Labels_Table_SelectRow');
                setHostAttr(
                    'title',
                    useClickableRows && isSelectable ? this._getOrAppendTitle(title) : null,
                    this._elementRef
                );

                setHostAttr(
                    'aria-keyshortcuts',
                    useClickableRows && isSelectable ? 'Enter Space' : null,
                    this._elementRef
                );
            }
        );
    }

    private _toggleIfClickable(): boolean {
        if (this._host.selectable && this._tableSelection.useClickableRows) {
            this._host.toggle();
            return true;
        }

        return false;
    }

    private _getOrAppendTitle(title: string): string {
        const currentTitle = this._elementRef.nativeElement.title;
        if (!currentTitle || currentTitle === title || currentTitle.endsWith(' - ' + title)) {
            return currentTitle || title;
        }

        return currentTitle + ' - ' + title;
    }
}
