import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    PuibeIconArrowComponent,
    PuibeSelectableDirective,
    PuibeSelectionDirective,
    PuibeTableCellComponent,
    PuibeTableCellDirective,
    PuibeTableColActionsComponent,
    PuibeTableColumnComponent,
    PuibeTableComponent,
    PuibeTableFooterComponent,
    PuibeTableHoverEmphasisDirective,
    PuibeTablePageSizeComponent,
    PuibeTablePaginationComponent,
    PuibeTablePaginationInfiniteScrollComponent,
    PuibeTableRowActionDirective,
    PuibeTableRowActionTriggerDirective,
    PuibeTableRowComponent,
    PuibeTableSelectableDirective,
    PuibeTableSelectionDirective,
    PuibeTwoColumnNavComponent,
    TableViewSource,
} from '@nexplore/practices-ui-ktbe';
import type { SampleModel } from './table-sample-data';
import { tableSampleLoadFn } from './table-sample-data';
import { TableExampleComponent } from './table-example/table-example.component';

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    imports: [
        PuibeTableComponent,
        PuibeTableColumnComponent,
        PuibeTableRowComponent,
        PuibeTableFooterComponent,
        PuibeTableCellComponent,
        PuibeTableHoverEmphasisDirective,
        PuibeSelectionDirective,
        PuibeSelectableDirective,
        PuibeTableSelectableDirective,
        PuibeTableSelectionDirective,
        PuibeTablePaginationComponent,
        PuibeTablePageSizeComponent,
        PuibeTablePaginationInfiniteScrollComponent,
        PuibeTableRowActionTriggerDirective,
        PuibeTableRowActionDirective,
        PuibeTableColActionsComponent,
        PuibeIconArrowComponent,
        PuibeTableCellDirective,
        PuibeTwoColumnNavComponent,
        TableExampleComponent,
        AsyncPipe,
        DatePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent {
    tableSource1 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5)
    );

    tableSource2 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5)
    );
    selectedItem2 = null;

    tableSource3 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5)
    );
    selectedItems3 = null;

    tableSource4 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 1000)
    );

    tableSource5 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5)
    );

    tableSource6 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5)
    );

    tableSource7 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5)
    );

    tableSource8 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 100),
        { take: 30 }
    );

    tableSource9 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5)
    );

    tableSource10 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5)
    );
}
