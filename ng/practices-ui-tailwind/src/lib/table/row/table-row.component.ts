import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, forwardRef, inject } from '@angular/core';
import { PuiTableCellComponent } from '../cell/table-cell.component';
import { ClassNames } from '../constants';
import { PuiTableComponent } from '../table.component';

@Component({
    standalone: true,
    selector: 'pui-table-row',
    templateUrl: './table-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, NgTemplateOutlet, NgComponentOutlet, forwardRef(() => PuiTableCellComponent)],
})
export class PuiTableRowComponent {
    private _table = inject(PuiTableComponent);

    @HostBinding('class')
    className = ClassNames.TABLE_ROW;

    @HostBinding('attr.role')
    role = 'row';

    @Input()
    borderBottom = true;

    @Input()
    borderTop = false;

    readonly beforeColumnTemplate$ = this._table.beforeColumnTemplate$;
}

