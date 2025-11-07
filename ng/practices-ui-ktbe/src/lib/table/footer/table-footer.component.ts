
import { ChangeDetectionStrategy, Component, ContentChildren, HostBinding, QueryList } from '@angular/core';
import { PuibeTableRowComponent } from '../row/table-row.component';

@Component({
    standalone: true,
    selector: 'puibe-table-footer',
    templateUrl: './table-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
})
export class PuibeTableFooterComponent {
    @HostBinding('class')
    className = 'table-footer-group';

    @HostBinding('attr.role')
    role = 'rowgroup';

    @ContentChildren(PuibeTableRowComponent)
    rows: QueryList<PuibeTableRowComponent>;
}
