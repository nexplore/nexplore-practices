
import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
import { PuiTableRowComponent } from '../row/table-row.component';

@Component({
    standalone: true,
    selector: 'pui-table-footer',
    templateUrl: './table-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
})
export class PuiTableFooterComponent {
    @HostBinding('class')
    className = 'table-footer-group';

    @HostBinding('attr.role')
    role = 'rowgroup';

    @ContentChildren(PuiTableRowComponent)
    rows: QueryList<PuiTableRowComponent>;
}

