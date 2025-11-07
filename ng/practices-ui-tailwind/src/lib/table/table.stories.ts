import { DatePipe, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiSelectableDirective, PuiSelectionDirective } from '../selection/selection.directive';
import {
    PuiTableSelectableDirective,
    PuiTableSelectionCheckboxComponent,
    PuiTableSelectionDirective,
} from '../selection/table-selection.directive';
import { PuiTableCellComponent } from './cell/table-cell.component';
import { PuiTableCellDirective } from './cell/table-cell.directive';
import { PuiTableColActionsComponent } from './col-actions/table-col-actions.component';
import { PuiTableColumnTranslateDirective } from './column/table-column-translate.directive';
import { PuiTableColumnComponent } from './column/table-column.component';
import { PuiTableFooterComponent } from './footer/table-footer.component';
import { PuiTablePaginationInfiniteScrollComponent } from './infinite-scroll/table-pagination-infinite-scroll.component';
import { PuiTablePageSizeComponent } from './pagination/table-page-size.component';
import { PuiTablePaginationComponent } from './pagination/table-pagination.component';
import { PuiTableRowActionTriggerDirective } from './row-action/table-row-action-trigger.directive';
import { PuiTableRowActionDirective } from './row-action/table-row-action.directive';
import { PuiTableRowComponent } from './row/table-row.component';
import { TableViewSource } from './table-view-source';
import { PuiTableComponent } from './table.component';

type Args = { showOptionsMenu?: boolean };

interface SampleModel {
    id: number;
    name: string;
    created: Date;
}

const sampleData = (count): SampleModel[] => {
    const sampleDataArray = [];
    for (let i = 1; i <= count; i++) {
        sampleDataArray.push({
            id: i,
            name: `Eintrag ${i}`,
            created: new Date(),
        });
    }
    return sampleDataArray;
};

const meta: Meta<Args> = {
    title: 'PUIBE/table',
    component: PuiTableComponent,
    tags: ['autodocs'],
    argTypes: { showOptionsMenu: { type: 'boolean', defaultValue: false } },
    decorators: [
        moduleMetadata({
            imports: [
                DatePipe,
                NgFor,
                PuiTableComponent,
                PuiTableRowComponent,
                PuiTableColumnComponent,
                PuiTableCellComponent,
                PuiTablePageSizeComponent,
                PuiTablePaginationComponent,
                PuiTablePaginationInfiniteScrollComponent,
                PuiTableFooterComponent,
                PuiSelectableDirective,
                PuiSelectionDirective,
                PuiTableSelectableDirective,
                PuiTableSelectionDirective,
                PuiTableSelectionCheckboxComponent,
                PuiTableRowActionDirective,
                PuiTableRowActionTriggerDirective,
                PuiTableColActionsComponent,
                PuiButtonDirective,
                PuiTableCellDirective,
                TranslateModule,
                PuiTableColumnTranslateDirective,
            ],
        }),
    ],
    render: () => ({}),
};

const defaultLoadFn = (count) => (params) => {
    return timer(1000).pipe(
        map((_) => ({
            data: sampleData(count).slice(params.skip, params.skip + params.take),
            total: count,
        })),
    );
};

export default meta;

type Story = StoryObj<Args>;

export const StaticTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table>
        

            <pui-table-column >H1</pui-table-column>
            <pui-table-column >H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>
            <pui-table-column>H4</pui-table-column>

            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell>A2</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
                <pui-table-cell>A4</pui-table-cell>
            </pui-table-row>

            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
                <pui-table-cell>B4</pui-table-cell>
            </pui-table-row>
            
        </pui-table>`,
    }),
};

export const StaticTableWithLongCellEntry: Story = {
    render: (_args) => ({
        template: `
        <pui-table class='w-full'>
            <pui-table-column >H1</pui-table-column>
            <pui-table-column class="w-full">H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>
            <pui-table-column>H4</pui-table-column>

            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell>asdfasdfasfdasdfasdfasdfasdfasdfasdfadfadsfafasdrfasdjkfasndkfjhadlufkjahndfujshandlkfujashdnfukjahdfljhfjkhdsalfkjshadlfkajnkhlakjdfhl</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
                <pui-table-cell>A4</pui-table-cell>
            </pui-table-row>

            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
                <pui-table-cell>B4</pui-table-cell>
            </pui-table-row>
            
        </pui-table>`,
    }),
};

export const EmptyTable: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(0),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full" noItemsMessage="No Items Found">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const StaticTableWithTranslatedColumns: Story = {
    render: (_args) => ({
        template: `
        <pui-table>    
            <pui-table-column translate>Practices.Labels_ByContent</pui-table-column>
            <pui-table-column translate="Practices.Labels_ByAttr"/>
            <pui-table-column translate="Practices.Labels_WithParams" [translateParams]="{wusa: 1}"></pui-table-column>
            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell>A2</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
            </pui-table-row>
            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
            </pui-table-row>            
        </pui-table>`,
    }),
};

export const TableWithViewSource: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(10),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" align="right" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell align="right">{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const SelectableTable: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(10),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" class="w-full" [selectionMode]="'single'" [(selectedItem)]="selectedItem">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async" [selectable]="item">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

            <pui-table-footer>
                <h3>Selected: {{selectedItem?.name ?? 'None'}}</h3>
            </pui-table-footer>
        </pui-table>`,
    }),
};

export const TableMultiSelect: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(20),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" class="w-full" [selectionMode]="'multi'" [(selectedItems)]="selectedItems">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async" [selectable]="item">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

            <pui-table-footer>
                <h3>{{selectedItems?.length}} items selected</h3>
            </pui-table-footer>

        </pui-table>`,
    }),
};

export const TableWithPaging: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(200),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

            <pui-table-footer>
                <pui-table-pagination>
                    <pui-table-page-size>Items per page </pui-table-page-size>
                </pui-table-pagination>
            </pui-table-footer>

        </pui-table>`,
    }),
};

export const TableWithPagingEndArrows: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(200),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

            <pui-table-footer>
                <pui-table-pagination [showFirstAndLastPageButton]="true">
                    <pui-table-page-size>Items per page </pui-table-page-size>
                </pui-table-pagination>
            </pui-table-footer>

        </pui-table>`,
    }),
};
export const TableWithInfiniteScroll: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(72),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

            <pui-table-footer>
                <pui-table-pagination-infinite-scroll [pageSize]="30"></pui-table-pagination-infinite-scroll>
            </pui-table-footer>

        </pui-table>`,
    }),
};

export const TableWithViewSourceAndAutomaticColumnConfig: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: {
                        id: { sortable: false },
                        name: { sortable: true },
                        created: { sortable: true },
                    },
                },
                defaultLoadFn(100),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" class="w-full">
            <pui-table-column [field]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [field]="tableSource.columns.name" class="w-full"></pui-table-column>
            <pui-table-column [field]="tableSource.columns.created" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>Actions</pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell>{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const TableWithViewSourceArray: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: {
                        id: { sortable: false },
                        name: { sortable: true },
                        created: { sortable: true },
                    },
                },
                defaultLoadFn(100),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" class="w-full">
            <pui-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></pui-table-column>
     
            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell class="w-full">{{item.name}}</pui-table-cell>
                <pui-table-cell class="min-w-[8rem]">{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};
export const TableWithTableViewSourceLabelKey: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: {
                        id: { sortable: false, columnLabelKey: 'Practices.Labels_Id' },
                        name: { sortable: true, columnLabelKey: 'Practices.Labels_Name' },
                        created: { sortable: true, columnLabelKey: 'Practices.Labels_Created' },
                    },
                },
                defaultLoadFn(100),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></pui-table-column>
     
            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell>{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const TableWithViewSourceLabelPrefix: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: {
                        id: { sortable: false },
                        name: { sortable: true },
                        created: { sortable: true },
                    },
                },
                defaultLoadFn(100),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" columnTranslationPrefix="Labels_SampleTable_" class="w-full">
            <pui-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></pui-table-column>
     
            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell>{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell></pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const TableWithColActions: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(100),
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>                 
                <pui-table-col-actions>
                    <button puiButton variant="secondary" size="small" type="button" title="Alle Akzeptieren" aria-label="Alle Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                </pui-table-col-actions>
            </pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell>
                    <pui-table-col-actions>
                        <button puiButton variant="secondary" size="small" type="button" title="Akzeptieren" aria-label="Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                        <button puiButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen" (click)="onActionClick('delete', item.id)">x</button>
                    </pui-table-col-actions>
                </pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const TableWithColActionsMenu: Story = {
    args: {
        showOptionsMenu: true,
    },
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(100),
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column>
                <pui-table-col-actions [showOptionsMenu]="${args.showOptionsMenu}">
                    <button (click)="onActionClick('accept', item.id)"><span class="font-bold mr-2">✓</span>Alle Akzeptieren</button>
                    <button (click)="onActionClick('delete', item.id)"><span class="font-bold mr-2">x</span>Alle Löschen</button>
                </pui-table-col-actions>
            </pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell>
                    <pui-table-col-actions [showOptionsMenu]="${args.showOptionsMenu}">
                        <button (click)="onActionClick('accept', item.id)"><span class="font-bold mr-2">✓</span>Akzeptieren</button>
                        <button (click)="onActionClick('delete', item.id)"><span class="font-bold mr-2">x</span>Löschen</button>
                    </pui-table-col-actions>
                </pui-table-cell>
            </pui-table-row>

        </pui-table>`,
    }),
};

export const TableWithRowAction: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(100),
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>
            <pui-table-column></pui-table-column>

            <pui-table-row puiTableRowActionTrigger *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>
                    <a puiTableRowAction href="https://google.com" target="_blank">{{item.id}}</a>
                </pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
                <pui-table-cell>
                    <pui-table-col-actions>
                        <button puiButton variant="secondary" size="small" type="button" title="Akzeptieren" aria-label="Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                        <button puiButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen" (click)="onActionClick('delete', item.id)">x</button>
                    </pui-table-col-actions>
                </pui-table-cell>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const TableWithToggleRowActionTrigger: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(10),
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
            puiTableRowActionTriggerDisabled: false,
        },
        template: `
        <button puiButton variant="danger" type="button" title="Toggle" aria-label="Toggle" (click)="puiTableRowActionTriggerDisabled = !puiTableRowActionTriggerDisabled">Toggle action trigger</button>
        <pui-table [tableViewSource]="tableSource"  class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></pui-table-column>

            <pui-table-row puiTableRowActionTrigger [puiTableRowActionTriggerDisabled]="puiTableRowActionTriggerDisabled" *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>
                    <a puiTableRowAction href="https://google.com" target="_blank">{{item.id}}</a>
                </pui-table-cell>
                <pui-table-cell >{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const RightSortableAlignmentTable: Story = {
    render: (args) => ({
        props: {
            ...args,
            tableSource: new TableViewSource<SampleModel>(
                {
                    columns: ['id', 'name', 'created'],
                },
                defaultLoadFn(5),
            ),
        },
        template: `
        <pui-table [tableViewSource]="tableSource" class="w-full">
            <pui-table-column [fieldName]="tableSource.columns.id" [sortable]='true'></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.name" align='right' [sortable]='true'></pui-table-column>
            <pui-table-column [fieldName]="tableSource.columns.created"></pui-table-column>

            <pui-table-row *ngFor="let item of tableSource.pageData$ | async">
                <pui-table-cell>{{item.id}}</pui-table-cell>
                <pui-table-cell align='right'>{{item.name}}</pui-table-cell>
                <pui-table-cell>{{item.created | date}}</pui-table-cell>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const RightAlignmentTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table class="w-full">
            <pui-table-column class="w-1/2">H1</pui-table-column>
            <pui-table-column class="w-5/12" align='right'>H2</pui-table-column>
            <pui-table-column class="w-1/12" align='right'>H3 H3H3H3</pui-table-column>

            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell align='right'>A2</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
            </pui-table-row>

            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell align='right'>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
            </pui-table-row>   
        </pui-table>`,
    }),
};

export const CustomBorderTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table class="w-full">
            <pui-table-column >H1</pui-table-column>

            <pui-table-row [borderBottom]='false'>
                <pui-table-cell>No Border</pui-table-cell>
            </pui-table-row>
            <pui-table-row>
                <pui-table-cell>Normal</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderBottom]='false'>
                <pui-table-cell>No border</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderBottom]='false'>
                <pui-table-cell>No border</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderBottom]='false' [borderTop]='true'>
                <pui-table-cell>Only top border</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderBottom]='false'>
                <pui-table-cell>No border</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderTop]='true'>
                <pui-table-cell>Bottom and top border</pui-table-cell>
            </pui-table-row>
            <pui-table-row [borderBottom]='false'>
                <pui-table-cell>No border</pui-table-cell>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const CellDirectiveTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table class="w-full">
            <pui-table-column >H1</pui-table-column>
            <pui-table-column align='right'>H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>

            <pui-table-row [borderBottom]='false'>
                <td puiTableCell>A1</td>
                <td puiTableCell align='right'>A2</td>
                <td puiTableCell>A3</td>
            </pui-table-row>

            <pui-table-row [borderBottom]='false'>
                <td puiTableCell>B1</td>
                <td puiTableCell align='center'>B2</td>
                <td puiTableCell>B3</td>
            </pui-table-row>   

            <pui-table-row [borderTop]='true' class="font-medium">
                <td puiTableCell>C1</td>
                <td puiTableCell align='left'>C2</td>
                <td puiTableCell>C3</td>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const CellInFooterTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table class="w-full">
            <pui-table-column >H1</pui-table-column>
            <pui-table-column align='right'>H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>

            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell align='right'>A2</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
            </pui-table-row>

            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell align='center'>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
            </pui-table-row>   
            <pui-table-footer>
                <pui-table-row [borderBottom]='false' class="bg-highlight">
                    <pui-table-cell>AB1</pui-table-cell>
                    <pui-table-cell align='left'>AB2</pui-table-cell>
                    <pui-table-cell>AB3</pui-table-cell>
                </pui-table-row>
            </pui-table-footer>
        </pui-table>`,
    }),
};

export const Celspan2WithDirectiveTable: Story = {
    render: (_args) => ({
        template: `
        <pui-table class="w-full">
            <pui-table-column >H1</pui-table-column>
            <pui-table-column align='right'>H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>

            <pui-table-row>
                <td puiTableCell colspan='2'>A1</td>
                <td puiTableCell>A3</td>
            </pui-table-row>

            <pui-table-row>
                <td puiTableCell>B1</td>
                <td puiTableCell align='right'>B2</td>
                <td puiTableCell>B3</td>
            </pui-table-row>
        </pui-table>`,
    }),
};

