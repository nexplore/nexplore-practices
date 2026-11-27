import { ChangeDetectionStrategy, Component, HostBinding, inject, Input } from '@angular/core';
import { PuibeAddTitleIfEllipsisDirective } from '../../util/add-title-if-ellipsis.directive';
import { PuibeTableComponent } from '../table.component';
import { PuibeTableCellDirective } from './table-cell.directive';

@Component({
    standalone: true,
    selector: 'puibe-table-cell',
    templateUrl: './table-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [PuibeAddTitleIfEllipsisDirective, { directive: PuibeTableCellDirective, inputs: ['noPadding'] }],
})
export class PuibeTableCellComponent {
    private readonly _table = inject(PuibeTableComponent, { optional: true });

    @HostBinding('attr.role')
    get role() {
        return this._table?.role === 'grid' ? 'gridcell' : 'cell';
    }

    @Input() align: 'center' | 'right' | 'left' = 'left';

    @HostBinding('class')
    get className() {
        return `text-${this.align}`;
    }
}
