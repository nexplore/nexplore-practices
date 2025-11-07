import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnInit, inject } from '@angular/core';
import { setHostClassNames } from '../../util/utils';
import { ClassNames } from '../constants';
import { PuiTableFooterComponent } from '../footer/table-footer.component';
import { PuiTableRowComponent } from '../row/table-row.component';

@Directive({
    standalone: true,
    selector: '[puiTableCell]',
})
export class PuiTableCellDirective implements OnInit, AfterViewInit {
    parentRow = inject(PuiTableRowComponent, { optional: true });
    parentFooter = inject(PuiTableFooterComponent, { optional: true });
    private _elementRef = inject(ElementRef);

    @HostBinding('class')
    className = ClassNames.TABLE_CELL;

    @Input() noPadding = false;

    ngOnInit() {
        setHostClassNames(
            {
                ['border-b']: this.parentRow === null || !!this.parentRow?.borderBottom,
                ['border-t']: !!this.parentRow?.borderTop,
                ['font-medium']: this.parentFooter !== null,
            },
            this._elementRef,
        );
    }

    ngAfterViewInit(): void {
        // If this method is not called after view init, then the default class name would override this one.
        setHostClassNames(
            {
                ['p-3']: !this.noPadding,
            },
            this._elementRef,
        );
    }
}

