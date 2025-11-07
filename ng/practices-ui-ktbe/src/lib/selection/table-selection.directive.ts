import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { PuibeTableComponent } from '../table/table.component';
import { setHostClassNames } from '../util/utils';
import { PuibeSelectableDirective, PuibeSelectionDirective } from './selection.directive';

@Component({
    selector: 'puibe-table-selection-checkbox',
    template: `<input type="checkbox" [ngModel]="checked$ | async" (ngModelChange)="onChange($event)" />`,
    imports: [FormsModule, AsyncPipe],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTableSelectionCheckboxComponent {
    private _selectableRow = inject(PuibeSelectableDirective, { optional: true });
    private _selectionTable = inject(PuibeSelectionDirective);

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
    selector: 'puibe-table[puibeSelectionMode], puibe-table[selectionMode]',
    standalone: true,
})
export class PuibeTableSelectionDirective {
    constructor() {
        const table = inject(PuibeTableComponent);
        const selection = inject(PuibeSelectionDirective);

        selection.selectionMode$.subscribe((selectionMode) => {
            if (selectionMode === 'multi') {
                table.beforeColumnTemplate = { componentType: PuibeTableSelectionCheckboxComponent };
            } else {
                table.beforeColumnTemplate = null;
            }
        });
    }
}

@Directive({
    selector: 'puibe-table-row[puibeSelectable], puibe-table-row[selectable]',
    standalone: true,
})
export class PuibeTableSelectableDirective {
    private _host = inject(PuibeSelectableDirective);
    private _elementRef = inject(ElementRef);

    @HostListener('click')
    onClick() {
        if (this._host.selectable && this._host.selectionMode === 'single') {
            this._host.toggle();
        }
    }

    constructor() {
        combineLatest([this._host.selected$, this._host.selectable$, this._host.selectionMode$]).subscribe(
            ([isSelected, isSelectable, selectionMode]) => {
                const isSingleSelect = selectionMode === 'single';
                setHostClassNames(
                    {
                        ['transition-all duration-200 cursor-pointer active:scale-x-95']:
                            isSelectable && isSingleSelect,

                        ['hover:bg-light-sand']: !isSelected && isSelectable && isSingleSelect,
                        ['hover:bg-sand-hover']: isSelected && isSelectable && isSingleSelect,

                        ['bg-dark-sand ']: isSelected && isSingleSelect,
                    },
                    this._elementRef
                );
            }
        );
    }
}
