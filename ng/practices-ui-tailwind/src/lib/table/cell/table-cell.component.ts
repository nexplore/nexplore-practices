import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { PuiAddTitleIfEllipsisDirective } from '../../util/add-title-if-ellipsis.directive';
import { PuiTableCellDirective } from './table-cell.directive';

@Component({
    standalone: true,
    selector: 'pui-table-cell',
    templateUrl: './table-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [PuiAddTitleIfEllipsisDirective, { directive: PuiTableCellDirective, inputs: ['noPadding'] }],
})
export class PuiTableCellComponent {
    @HostBinding('attr.role')
    role = 'cell';

    @Input() align: 'center' | 'right' | 'left' = 'left';

    @HostBinding('class')
    get className() {
        return `text-${this.align}`;
    }
}

