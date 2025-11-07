import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, forwardRef, inject } from '@angular/core';
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
    private _table = inject(PuibeTableComponent);

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
