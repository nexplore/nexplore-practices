import { NgModule } from '@angular/core';
import {
    PuibeTableCellComponent,
    PuibeTableColActionsComponent,
    PuibeTableColumnComponent,
    PuibeTableComponent,
    PuibeTableFooterComponent,
    PuibeTablePageSizeComponent,
    PuibeTablePaginationComponent,
    PuibeTableRowActionDirective,
    PuibeTableRowActionTriggerDirective,
    PuibeTableRowComponent,
    PuibeTableCellDirective,
    PuibeTableColumnTranslateDirective,
    PuibeTableHoverEmphasisDirective,
    PuibeTablePaginationInfiniteScrollComponent,
} from '.';

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
