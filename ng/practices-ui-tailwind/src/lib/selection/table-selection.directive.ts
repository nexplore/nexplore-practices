import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { PuiTableComponent } from '../table/table.component';
import { setHostClassNames } from '../util/utils';
import { PuiSelectableDirective, PuiSelectionDirective } from './selection.directive';

@Component({
    selector: 'pui-table-selection-checkbox',
    template: `<input type="checkbox" [ngModel]="checked$ | async" (ngModelChange)="onChange($event)" />`,
    imports: [FormsModule, AsyncPipe],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiTableSelectionCheckboxComponent {
    private _selectableRow = inject(PuiSelectableDirective, { optional: true });
    private _selectionTable = inject(PuiSelectionDirective);

    readonly checked$ = this._selectableRow?.selected$ ?? this._selectionTable.selectAll;

    onChange(checked: boolean) {
        if (this._selectableRow) {
            this._selectableRow.toggle(checked);
        } else {
            this._selectionTable.toggleAll(checked);
        }
    }
}

@Directive({
    selector: 'pui-table[puiSelectionMode], pui-table[selectionMode]',
    standalone: true,
})
export class PuiTableSelectionDirective {
    constructor() {
        const table = inject(PuiTableComponent);
        const selection = inject(PuiSelectionDirective);

        const _selectionModeSub = selection.selectionMode$.subscribe((selectionMode) => {
            if (selectionMode === 'multi') {
                table.beforeColumnTemplate = { componentType: PuiTableSelectionCheckboxComponent };
            } else {
                table.beforeColumnTemplate = null;
            }
        });
    }
}

@Directive({
    selector: 'pui-table-row[puiSelectable], pui-table-row[selectable]',
    standalone: true,
})
export class PuiTableSelectableDirective {
    private _host = inject(PuiSelectableDirective);
    private _elementRef = inject(ElementRef);

    @HostListener('click')
    onClick() {
        if (this._host.selectable && this._host.selectionMode === 'single') {
            this._host.toggle();
        }
    }

    constructor() {
        const _rowSelectableSub = combineLatest([
            this._host.selected$,
            this._host.selectable$,
            this._host.selectionMode$,
        ]).subscribe(([isSelected, isSelectable, selectionMode]) => {
            const isSingleSelect = selectionMode === 'single';
            setHostClassNames(
                {
                    ['transition-all duration-200 cursor-pointer active:scale-x-95']: isSelectable && isSingleSelect,

                    ['hover:bg-very-light-secondary']: !isSelected && isSelectable && isSingleSelect,
                    ['hover:bg-surface-hover']: isSelected && isSelectable && isSingleSelect,

                    ['bg-dark-highlight ']: isSelected && isSingleSelect,
                },
                this._elementRef,
            );
        });
    }
}

