import { AfterViewInit, Directive, ElementRef, HostBinding, inject, Input, OnInit, Optional } from '@angular/core';
import { PuibeTableRowComponent } from '../row/table-row.component';
import { PuibeTableFooterComponent } from '../footer/table-footer.component';
import { ClassNames } from '../constants';
import { setHostClassNames } from '../../util/utils';
import { PuibeTableComponent } from '../table.component';

@Directive({
    standalone: true,
    selector: '[puibeTableCell]',
})
export class PuibeTableCellDirective implements OnInit, AfterViewInit {
    private readonly _table = inject(PuibeTableComponent, { optional: true });

    @HostBinding('class')
    className = ClassNames.TABLE_CELL;

    @Input() noPadding = false;

    /**
     * The number of columns the cell spans.
     * Only needed for the grid layout (`useGridLayout`), on a `td` element the native `colspan` attribute is still applied for the table layout.
     */
    @HostBinding('style.--puibe-colspan')
    @Input()
    colspan: number | string | undefined;

    // Keep the native colspan attribute in sync on table cells, e.g. when bound with `[colspan]`
    @HostBinding('attr.colspan')
    protected get colspanAttr() {
        return this._elementRef.nativeElement.tagName === 'TD' ? this.colspan ?? null : null;
    }

    constructor(
        @Optional()
        public parentRow: PuibeTableRowComponent,
        @Optional()
        public parentFooter: PuibeTableFooterComponent,
        private _elementRef: ElementRef
    ) {}

    @HostBinding('class.table-cell')
    protected get isTableLayout() {
        return !this._table?.useGridLayout;
    }

    // With the grid layout, the borders are applied to the row (subgrid) instead of the cells
    @HostBinding('class.border-b')
    protected get hasBorderBottom() {
        return this.isTableLayout && (this.parentRow === null || this.parentRow.borderBottom);
    }

    @HostBinding('class.border-t')
    protected get hasBorderTop() {
        return this.isTableLayout && !!this.parentRow?.borderTop;
    }

    ngOnInit() {
        setHostClassNames(
            {
                ['font-medium']: this.parentFooter !== null,
            },
            this._elementRef
        );
    }

    ngAfterViewInit(): void {
        // If this method is not called after view init, then the default class name would override this one.
        setHostClassNames(
            {
                ['p-3']: !this.noPadding,
            },
            this._elementRef
        );
    }
}
