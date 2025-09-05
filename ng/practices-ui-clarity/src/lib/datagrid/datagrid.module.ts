import { NgModule } from '@angular/core';

import { DatagridListViewSourceDirective } from './datagrid-list-view-source.component';
import { PaginationDirective } from './pagination.component';

@NgModule({
    imports: [DatagridListViewSourceDirective, PaginationDirective],
    exports: [DatagridListViewSourceDirective, PaginationDirective],
})
export class DatagridModule {}
