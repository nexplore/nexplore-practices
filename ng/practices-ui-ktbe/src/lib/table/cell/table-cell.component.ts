import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { PuibeAddTitleIfEllipsisDirective } from '../../util/add-title-if-ellipsis.directive';
import { PuibeTableCellDirective } from './table-cell.directive';

@Component({
    standalone: true,
    selector: 'puibe-table-cell',
    templateUrl: './table-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [PuibeAddTitleIfEllipsisDirective, { directive: PuibeTableCellDirective, inputs: ['noPadding'] }],
})
export class PuibeTableCellComponent {
    @HostBinding('attr.role')
    role = 'cell';

    @Input() align: 'center' | 'right' | 'left' = 'left';

    @HostBinding('class')
    get className() {
        return `text-${this.align}`;
    }
}
