import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IQueryParamsWithFilter, OrderDirection } from '@nexplore/practices-ui';
import {
    PuiIconArrowComponent,
    PuiSelectableDirective,
    PuiSelectionDirective,
    PuiTableCellComponent,
    PuiTableCellDirective,
    PuiTableColActionsComponent,
    PuiTableColumnComponent,
    PuiTableComponent,
    PuiTableFooterComponent,
    PuiTableHoverEmphasisDirective,
    PuiTablePageSizeComponent,
    PuiTablePaginationComponent,
    PuiTablePaginationInfiniteScrollComponent,
    PuiTableRowActionDirective,
    PuiTableRowActionTriggerDirective,
    PuiTableRowComponent,
    PuiTableSelectableDirective,
    PuiTableSelectionDirective,
    PuiTwoColumnNavComponent,
    TableViewSource,
} from '@nexplore/practices-ui-tailwind';
import { map, timer } from 'rxjs';
import { TableExampleComponent } from './table-example/table-example.component';

export interface SampleModel {
    id: number;
    name: string;
    created: Date;
}

function generateItem<TItem>(i: number) {
    return { id: i, name: `Eintrag ${i}`, created: new Date() } as TItem;
}

function generateSampleData<TItem = SampleModel>(size: number, generateItemFn = generateItem<TItem>) {
    const data = [];
    for (let i = 0; i < size; i++) {
        data.push(generateItemFn(i));
    }

    return data as TItem[];
}

export const tableSampleLoadFn = <TItem = SampleModel, TFilter = any>(
    params: IQueryParamsWithFilter<TFilter>,
    size: number,
    generateItemFn = generateItem<TItem>,
) => {
    let data = generateSampleData(size, generateItemFn);

    if (params.orderings && params.orderings.length > 0) {
        data = data.sort((a, b) => {
            return params.orderings[0].direction === OrderDirection.Asc
                ? a[params.orderings[0].field] > b[params.orderings[0].field]
                    ? 1
                    : -1
                : b[params.orderings[0].field] > a[params.orderings[0].field]
                  ? 1
                  : -1;
        });
    }

    if (params.filter) {
        data = data.filter((d) => {
            return Object.entries(params.filter).every(([key, value]) =>
                value === null ? true : d[key]?.toString()?.includes(value?.toString()),
            );
        });
    }

    if (params.skip != null && params.take != null) {
        data = data.slice(params.skip, params.skip + params.take);
    }

    return timer(1000).pipe(
        map((_) => ({
            data: data,
            total: size,
        })),
    );
};

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    imports: [
    PuiTableComponent,
    PuiTableColumnComponent,
    PuiTableRowComponent,
    PuiTableFooterComponent,
    PuiTableCellComponent,
    PuiTableHoverEmphasisDirective,
    PuiSelectionDirective,
    PuiSelectableDirective,
    PuiTableSelectableDirective,
    PuiTableSelectionDirective,
    PuiTablePaginationComponent,
    PuiTablePageSizeComponent,
    PuiTablePaginationInfiniteScrollComponent,
    PuiTableRowActionTriggerDirective,
    PuiTableRowActionDirective,
    PuiTableColActionsComponent,
    PuiIconArrowComponent,
    PuiTableCellDirective,
    PuiTwoColumnNavComponent,
    TableExampleComponent,
    AsyncPipe,
    DatePipe
],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent {
    tableSource1 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5),
    );

    tableSource2 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5),
    );
    selectedItem2 = null;

    tableSource3 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5),
    );
    selectedItems3 = null;

    tableSource4 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 1000),
    );

    tableSource5 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5),
    );

    tableSource6 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5),
    );

    tableSource7 = new TableViewSource<SampleModel>(
        {
            columns: {
                id: { sortable: false },
                name: { sortable: true },
                created: { sortable: true },
            },
        },
        (params) => tableSampleLoadFn(params, 5),
    );

    tableSource8 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 100),
        { take: 30 },
    );

    tableSource9 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5),
    );

    tableSource10 = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 5),
    );
}

