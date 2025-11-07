import { NgModule } from '@angular/core';
import {
    PuiTableCellComponent,
    PuiTableCellDirective,
    PuiTableColActionsComponent,
    PuiTableColumnComponent,
    PuiTableColumnTranslateDirective,
    PuiTableComponent,
    PuiTableFooterComponent,
    PuiTableHoverEmphasisDirective,
    PuiTablePageSizeComponent,
    PuiTablePaginationComponent,
    PuiTablePaginationInfiniteScrollComponent,
    PuiTableRowActionDirective,
    PuiTableRowActionTriggerDirective,
    PuiTableRowComponent,
} from '.';

const DEFAULT_TABLE_COMPONENT_IMPORTS = [
    PuiTableComponent,
    PuiTableColumnComponent,
    PuiTableColumnTranslateDirective,
    PuiTableRowComponent,
    PuiTableCellComponent,
    PuiTableFooterComponent,
    PuiTablePaginationComponent,
    PuiTablePageSizeComponent,
    PuiTableRowActionTriggerDirective,
    PuiTableRowActionDirective,
    PuiTableColActionsComponent,
    PuiTableCellDirective,
    PuiTableHoverEmphasisDirective,
    PuiTablePaginationInfiniteScrollComponent,
];

@NgModule({
    imports: DEFAULT_TABLE_COMPONENT_IMPORTS,
    exports: DEFAULT_TABLE_COMPONENT_IMPORTS,
})
export class PracticesTailwindTableComponentsModule {}

