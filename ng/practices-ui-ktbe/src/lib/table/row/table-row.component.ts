import { AsyncPipe, NgClass, NgComponentOutlet, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, forwardRef } from '@angular/core';
import { PuibeTableComponent } from '../table.component';
import { ClassNames } from '../constants';
import { PuibeTableCellComponent } from '../cell/table-cell.component';

@Component({
    standalone: true,
    selector: 'puibe-table-row',
    templateUrl: './table-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, NgClass, AsyncPipe, NgTemplateOutlet, NgComponentOutlet, forwardRef(() => PuibeTableCellComponent)],
})
export class PuibeTableRowComponent {
    @HostBinding('class')
    className = ClassNames.TABLE_ROW;

    @HostBinding('attr.role')
    role = 'row';

    @Input()
    borderBottom = true;

    @Input()
    borderTop = false;

    readonly beforeColumnTemplate$ = this._table.beforeColumnTemplate$;

    constructor(private _table: PuibeTableComponent) {}
}
