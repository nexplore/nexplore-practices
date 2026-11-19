import { NgModule } from '@angular/core';
import { PuibeTableHoverEmphasisDirective } from './lib/table/cell/hover-emphasis.directive';
import { PuibeTableCellComponent } from './lib/table/cell/table-cell.component';
import { PuibeTableCellDirective } from './lib/table/cell/table-cell.directive';
import { PuibeTableColActionsComponent } from './lib/table/col-actions/table-col-actions.component';
import { PuibeTableColumnTranslateDirective } from './lib/table/column/table-column-translate.directive';
import { PuibeTableColumnComponent } from './lib/table/column/table-column.component';
import { PuibeTableFooterComponent } from './lib/table/footer/table-footer.component';
import { PuibeTablePaginationInfiniteScrollComponent } from './lib/table/infinite-scroll/table-pagination-infinite-scroll.component';
import { PuibeTablePageSizeComponent } from './lib/table/pagination/table-page-size.component';
import { PuibeTablePaginationComponent } from './lib/table/pagination/table-pagination.component';
import { PuibeTableRowActionTriggerDirective } from './lib/table/row-action/table-row-action-trigger.directive';
import { PuibeTableRowActionDirective } from './lib/table/row-action/table-row-action.directive';
import { PuibeTableRowComponent } from './lib/table/row/table-row.component';
import { PuibeTableComponent } from './lib/table/table.component';

const DEFAULT_TABLE_COMPONENT_IMPORTS = [
    PuibeTableComponent,
    PuibeTableColumnComponent,
    PuibeTableColumnTranslateDirective,
    PuibeTableRowComponent,
    PuibeTableCellComponent,
    PuibeTableFooterComponent,
    PuibeTablePaginationComponent,
    PuibeTablePageSizeComponent,
    PuibeTableRowActionTriggerDirective,
    PuibeTableRowActionDirective,
    PuibeTableColActionsComponent,
    PuibeTableCellDirective,
    PuibeTableHoverEmphasisDirective,
    PuibeTablePaginationInfiniteScrollComponent,
];

@NgModule({
    imports: DEFAULT_TABLE_COMPONENT_IMPORTS,
    exports: DEFAULT_TABLE_COMPONENT_IMPORTS,
})
export class PracticesKtbeTableComponentsModule {}
