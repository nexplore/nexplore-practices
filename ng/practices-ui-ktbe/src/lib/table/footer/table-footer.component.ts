import {
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    HostBinding,
    inject,
    Input,
    QueryList,
} from '@angular/core';
import { PuibeTableRowComponent } from '../row/table-row.component';
import { PuibeTableComponent } from '../table.component';

@Component({
    standalone: true,
    selector: 'puibe-table-footer',
    templateUrl: './table-footer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTableFooterComponent {
    private readonly _table = inject(PuibeTableComponent, { optional: true });

    /** Makes the footer stick to the bottom of the scroll container. Defaults to the `useStickyFooter` input of the table. */
    @Input()
    sticky: boolean | undefined = undefined;

    @HostBinding('class')
    get className() {
        const classNames = this._table?.useGridLayout ? [] : ['table-footer-group'];
        if (this.sticky ?? this._table?.useStickyFooter) {
            classNames.push('sticky bottom-0 z-[1] border-t border-dark-gray-68 bg-white');
        }
        return classNames.join(' ');
    }

    @HostBinding('attr.role')
    role = 'rowgroup';

    @ContentChildren(PuibeTableRowComponent)
    rows: QueryList<PuibeTableRowComponent>;
}
