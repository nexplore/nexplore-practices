import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    PuibeTableCellComponent,
    PuibeTableColumnComponent,
    PuibeTableComponent,
    PuibeTableFooterComponent,
    PuibeTableHoverEmphasisDirective,
    PuibeTablePaginationComponent,
    PuibeTablePaginationInfiniteScrollComponent,
    PuibeTableRowActionTriggerDirective,
    PuibeTableRowComponent,
    TableViewSource,
} from '@nexplore/practices-ui-ktbe';
import { SampleModel, tableSampleLoadFn } from '../tables/tables.component';

@Component({
    standalone: true,
    selector: 'app-tables-infinite-scrolling',
    templateUrl: './tables-infinite-scrolling.component.html',
    imports: [
        PuibeTableComponent,
        PuibeTableColumnComponent,
        PuibeTableRowComponent,
        PuibeTableFooterComponent,
        PuibeTableCellComponent,
        PuibeTableHoverEmphasisDirective,
        PuibeTablePaginationComponent,
        PuibeTableRowActionTriggerDirective,
        PuibeTablePaginationInfiniteScrollComponent,
        AsyncPipe,
        DatePipe,
        NgFor,
        NgIf,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesInfiniteScrollingComponent {
    tableSource = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 300),
        { take: 30 }
    );
}
