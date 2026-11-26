import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  PuiTableCellComponent,
  PuiTableColumnComponent,
  PuiTableComponent,
  PuiTableFooterComponent,
  PuiTableHoverEmphasisDirective,
  PuiTablePaginationInfiniteScrollComponent,
  PuiTableRowActionTriggerDirective,
  PuiTableRowComponent,
  TableViewSource
} from '@nexplore/practices-ui-tailwind';
import { SampleModel, tableSampleLoadFn } from '../tables/tables.component';

@Component({
    standalone: true,
    selector: 'app-tables-infinite-scrolling',
    templateUrl: './tables-infinite-scrolling.component.html',
    imports: [
    PuiTableComponent,
    PuiTableColumnComponent,
    PuiTableRowComponent,
    PuiTableFooterComponent,
    PuiTableCellComponent,
    PuiTableHoverEmphasisDirective,
    PuiTableRowActionTriggerDirective,
    PuiTablePaginationInfiniteScrollComponent,
    AsyncPipe,
    DatePipe
],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesInfiniteScrollingComponent {
    tableSource = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 300),
        { take: 30 },
    );
}

