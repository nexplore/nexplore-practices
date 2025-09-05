import { Directive, Optional } from '@angular/core';
import { ClrDatagridPagination } from '@clr/angular';

import { DatagridListViewSourceDirective } from './datagrid-list-view-source.component';

@Directive({
    selector: 'clr-dg-pagination[puiclrPagination]',
    standalone: true,
})
export class PaginationDirective {
    constructor(
        private pagination: ClrDatagridPagination,
        @Optional() private datagridListViewSourceDirective: DatagridListViewSourceDirective
    ) {
        if (this.datagridListViewSourceDirective === null) {
            throw new Error('The puiclrListViewSource directive is missing on the parent ClrDatagrid');
        }

        this.datagridListViewSourceDirective.pagination = this.pagination;
    }
}
