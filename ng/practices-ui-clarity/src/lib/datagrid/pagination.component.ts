import { Directive, inject } from '@angular/core';
import { ClrDatagridPagination } from '@clr/angular';

import { DatagridListViewSourceDirective } from './datagrid-list-view-source.component';

@Directive({
    selector: 'clr-dg-pagination[puiclrPagination]',
    standalone: true,
})
export class PaginationDirective {
    private pagination = inject(ClrDatagridPagination);
    private datagridListViewSourceDirective = inject(DatagridListViewSourceDirective, { optional: true });

    constructor() {
        if (this.datagridListViewSourceDirective === null) {
            throw new Error('The puiclrListViewSource directive is missing on the parent ClrDatagrid');
        }

        this.datagridListViewSourceDirective.pagination = this.pagination;
    }
}
