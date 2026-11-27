import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, forwardRef } from '@angular/core';
import { PuibeTableComponent } from '../table.component';
import { ClassNames } from '../constants';
import { PuibeTableCellComponent } from '../cell/table-cell.component';

@Component({
    standalone: true,
    selector: 'puibe-table-row',
    templateUrl: './table-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, NgTemplateOutlet, NgComponentOutlet, forwardRef(() => PuibeTableCellComponent)],
})
export class PuibeTableRowComponent {
    @HostBinding('class')
    get className() {
        return this._table.useGridLayout ? ClassNames.TABLE_ROW_GRID : ClassNames.TABLE_ROW;
    }

    @HostBinding('attr.role')
    role = 'row';

    @Input()
    borderBottom = true;

    @Input()
    borderTop = false;

    // With the grid layout, the borders are applied to the row (subgrid) instead of the cells
    @HostBinding('class.border-b')
    protected get hasGridBorderBottom() {
        return this._table.useGridLayout && this.borderBottom;
    }

    @HostBinding('class.border-t')
    protected get hasGridBorderTop() {
        return this._table.useGridLayout && this.borderTop;
    }

    readonly beforeColumnTemplate$ = this._table.beforeColumnTemplate$;

    constructor(private _table: PuibeTableComponent) {}
}
