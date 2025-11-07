import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  PuibeTableCellComponent,
  PuibeTableColumnComponent,
  PuibeTableComponent,
  PuibeTableFooterComponent,
  PuibeTableHoverEmphasisDirective,
  PuibeTablePaginationInfiniteScrollComponent,
  PuibeTableRowActionTriggerDirective,
  PuibeTableRowComponent,
  TableViewSource
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
    PuibeTableRowActionTriggerDirective,
    PuibeTablePaginationInfiniteScrollComponent,
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
        { take: 30 }
    );
}
