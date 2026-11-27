import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
// eslint-disable-next-line import-x/no-cycle -- Angular parent/child pattern: the table components inject their parents and query their children at runtime (forwardRef).
import { PuibeTableRowComponent } from '../row/table-row.component';

@Component({
    standalone: true,
    selector: 'puibe-table-footer',
    templateUrl: './table-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTableFooterComponent {
    @HostBinding('class')
    className = 'table-footer-group';

    @HostBinding('attr.role')
    role = 'rowgroup';

    @ContentChildren(PuibeTableRowComponent)
    rows: QueryList<PuibeTableRowComponent>;
}
