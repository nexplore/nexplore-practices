import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnInit, inject } from '@angular/core';
import { PuibeTableRowComponent } from '../row/table-row.component';
import { PuibeTableFooterComponent } from '../footer/table-footer.component';
import { ClassNames } from '../constants';
import { setHostClassNames } from '../../util/utils';

@Directive({
    standalone: true,
    selector: '[puibeTableCell]',
})
export class PuibeTableCellDirective implements OnInit, AfterViewInit {
    parentRow = inject(PuibeTableRowComponent, { optional: true });
    parentFooter = inject(PuibeTableFooterComponent, { optional: true });
    private _elementRef = inject(ElementRef);

    @HostBinding('class')
    className = ClassNames.TABLE_CELL;

    @Input() noPadding = false;

    ngOnInit() {
        setHostClassNames(
            {
                ['border-b']: this.parentRow === null || this.parentRow.borderBottom,
                ['border-t']: this.parentRow?.borderTop,
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
