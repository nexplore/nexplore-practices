import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PuibeTableComponent } from './table.component';
import { TableViewSource } from './table-view-source';
import { DatePipe, NgFor } from '@angular/common';
import { PuibeTablePageSizeComponent } from './pagination/table-page-size.component';
import { PuibeTablePaginationComponent } from './pagination/table-pagination.component';
import { PuibeTableFooterComponent } from './footer/table-footer.component';
import { PuibeSelectableDirective, PuibeSelectionDirective } from '../selection/selection.directive';
import {
    PuibeTableSelectableDirective,
    PuibeTableSelectionCheckboxComponent,
    PuibeTableSelectionDirective,
} from '../selection/table-selection.directive';
import { PuibeTableRowActionTriggerDirective } from './row-action/table-row-action-trigger.directive';
import { PuibeTableRowActionDirective } from './row-action/table-row-action.directive';
import { PuibeTableColActionsComponent } from './col-actions/table-col-actions.component';
import { PuibeTableColumnComponent } from './column/table-column.component';
import { PuibeTableCellComponent } from './cell/table-cell.component';
import { PuibeTableRowComponent } from './row/table-row.component';
import { PuibeButtonDirective } from '../button/button.directive';
import { PuibeTablePaginationInfiniteScrollComponent } from './infinite-scroll/table-pagination-infinite-scroll.component';
import { PuibeTableCellDirective } from './cell/table-cell.directive';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeTableColumnTranslateDirective } from './column/table-column-translate.directive';

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
    component: PuibeTableComponent,
    tags: ['autodocs'],
    argTypes: { showOptionsMenu: { type: 'boolean', defaultValue: false } },
    decorators: [
        moduleMetadata({
            imports: [
                DatePipe,
                NgFor,
                PuibeTableComponent,
                PuibeTableRowComponent,
                PuibeTableColumnComponent,
                PuibeTableCellComponent,
                PuibeTablePageSizeComponent,
                PuibeTablePaginationComponent,
                PuibeTablePaginationInfiniteScrollComponent,
                PuibeTableFooterComponent,
                PuibeSelectableDirective,
                PuibeSelectionDirective,
                PuibeTableSelectableDirective,
                PuibeTableSelectionDirective,
                PuibeTableSelectionCheckboxComponent,
                PuibeTableRowActionDirective,
                PuibeTableRowActionTriggerDirective,
                PuibeTableColActionsComponent,
                PuibeButtonDirective,
                PuibeTableCellDirective,
                TranslateModule,
                PuibeTableColumnTranslateDirective,
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
        }))
    );
};

export default meta;

type Story = StoryObj<Args>;

export const StaticTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table>
        

            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column >H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>
            <puibe-table-column>H4</puibe-table-column>

            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell>A2</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
                <puibe-table-cell>A4</puibe-table-cell>
            </puibe-table-row>

            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
                <puibe-table-cell>B4</puibe-table-cell>
            </puibe-table-row>
            
        </puibe-table>`,
    }),
};

export const StaticTableWithLongCellEntry: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class='w-full'>
            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column class="w-full">H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>
            <puibe-table-column>H4</puibe-table-column>

            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell>asdfasdfasfdasdfasdfasdfasdfasdfasdfadfadsfafasdrfasdjkfasndkfjhadlufkjahndfujshandlkfujashdnfukjahdfljhfjkhdsalfkjshadlfkajnkhlakjdfhl</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
                <puibe-table-cell>A4</puibe-table-cell>
            </puibe-table-row>

            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
                <puibe-table-cell>B4</puibe-table-cell>
            </puibe-table-row>
            
        </puibe-table>`,
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
                defaultLoadFn(0)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full" noItemsMessage="No Items Found">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
    }),
};

export const StaticTableWithTranslatedColumns: Story = {
    render: (_args) => ({
        template: `
        <puibe-table>    
            <puibe-table-column translate>Practices.Labels_ByContent</puibe-table-column>
            <puibe-table-column translate="Practices.Labels_ByAttr"/>
            <puibe-table-column translate="Practices.Labels_WithParams" [translateParams]="{wusa: 1}"></puibe-table-column>
            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell>A2</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
            </puibe-table-row>            
        </puibe-table>`,
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
                defaultLoadFn(10)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" align="right" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell align="right">{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(10)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" class="w-full" [selectionMode]="'single'" [(selectedItem)]="selectedItem">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async" [selectable]="item">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

            <puibe-table-footer>
                <h3>Selected: {{selectedItem?.name ?? 'None'}}</h3>
            </puibe-table-footer>
        </puibe-table>`,
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
                defaultLoadFn(20)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" class="w-full" [selectionMode]="'multi'" [(selectedItems)]="selectedItems">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async" [selectable]="item">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

            <puibe-table-footer>
                <h3>{{selectedItems?.length}} items selected</h3>
            </puibe-table-footer>

        </puibe-table>`,
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
                defaultLoadFn(200)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

            <puibe-table-footer>
                <puibe-table-pagination>
                    <puibe-table-page-size>Items per page </puibe-table-page-size>
                </puibe-table-pagination>
            </puibe-table-footer>

        </puibe-table>`,
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
                defaultLoadFn(200)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

            <puibe-table-footer>
                <puibe-table-pagination [showFirstAndLastPageButton]="true">
                    <puibe-table-page-size>Items per page </puibe-table-page-size>
                </puibe-table-pagination>
            </puibe-table-footer>

        </puibe-table>`,
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
                defaultLoadFn(72)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

            <puibe-table-footer>
                <puibe-table-pagination-infinite-scroll [pageSize]="30"></puibe-table-pagination-infinite-scroll>
            </puibe-table-footer>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" class="w-full">
            <puibe-table-column [field]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [field]="tableSource.columns.name" class="w-full"></puibe-table-column>
            <puibe-table-column [field]="tableSource.columns.created" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>Actions</puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell>{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" class="w-full">
            <puibe-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></puibe-table-column>
     
            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell class="w-full">{{item.name}}</puibe-table-cell>
                <puibe-table-cell class="min-w-[8rem]">{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></puibe-table-column>
     
            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell>{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" columnTranslationPrefix="Labels_SampleTable_" class="w-full">
            <puibe-table-column *ngFor="let columnDef of tableSource.columnsArray$ | async" [field]="columnDef"></puibe-table-column>
     
            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell>{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell></puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>                 
                <puibe-table-col-actions>
                    <button puibeButton variant="secondary" size="small" type="button" title="Alle Akzeptieren" aria-label="Alle Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                </puibe-table-col-actions>
            </puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell>
                    <puibe-table-col-actions>
                        <button puibeButton variant="secondary" size="small" type="button" title="Akzeptieren" aria-label="Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                        <button puibeButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen" (click)="onActionClick('delete', item.id)">x</button>
                    </puibe-table-col-actions>
                </puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column>
                <puibe-table-col-actions [showOptionsMenu]="${args.showOptionsMenu}">
                    <button (click)="onActionClick('accept', item.id)"><span class="font-bold mr-2">✓</span>Alle Akzeptieren</button>
                    <button (click)="onActionClick('delete', item.id)"><span class="font-bold mr-2">x</span>Alle Löschen</button>
                </puibe-table-col-actions>
            </puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell>
                    <puibe-table-col-actions [showOptionsMenu]="${args.showOptionsMenu}">
                        <button (click)="onActionClick('accept', item.id)"><span class="font-bold mr-2">✓</span>Akzeptieren</button>
                        <button (click)="onActionClick('delete', item.id)"><span class="font-bold mr-2">x</span>Löschen</button>
                    </puibe-table-col-actions>
                </puibe-table-cell>
            </puibe-table-row>

        </puibe-table>`,
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
                defaultLoadFn(100)
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>
            <puibe-table-column></puibe-table-column>

            <puibe-table-row puibeTableRowActionTrigger *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>
                    <a puibeTableRowAction href="https://google.com" target="_blank">{{item.id}}</a>
                </puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
                <puibe-table-cell>
                    <puibe-table-col-actions>
                        <button puibeButton variant="secondary" size="small" type="button" title="Akzeptieren" aria-label="Akzeptieren" (click)="onActionClick('accept', item.id)">✓</button>
                        <button puibeButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen" (click)="onActionClick('delete', item.id)">x</button>
                    </puibe-table-col-actions>
                </puibe-table-cell>
            </puibe-table-row>
        </puibe-table>`,
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
                defaultLoadFn(10)
            ),
            onActionClick: (act: string, id: number) => console.log('clicked col action', act, id),
            puibeTableRowActionTriggerDisabled: false,
        },
        template: `
        <button puibeButton variant="danger" type="button" title="Toggle" aria-label="Toggle" (click)="puibeTableRowActionTriggerDisabled = !puibeTableRowActionTriggerDisabled">Toggle action trigger</button>
        <puibe-table [tableViewSource]="tableSource"  class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" [sortable]="true" class="w-full"></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created" [sortable]="true" class="min-w-[8rem]"></puibe-table-column>

            <puibe-table-row puibeTableRowActionTrigger [puibeTableRowActionTriggerDisabled]="puibeTableRowActionTriggerDisabled" *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>
                    <a puibeTableRowAction href="https://google.com" target="_blank">{{item.id}}</a>
                </puibe-table-cell>
                <puibe-table-cell >{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
            </puibe-table-row>
        </puibe-table>`,
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
                defaultLoadFn(5)
            ),
        },
        template: `
        <puibe-table [tableViewSource]="tableSource" class="w-full">
            <puibe-table-column [fieldName]="tableSource.columns.id" [sortable]='true'></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.name" align='right' [sortable]='true'></puibe-table-column>
            <puibe-table-column [fieldName]="tableSource.columns.created"></puibe-table-column>

            <puibe-table-row *ngFor="let item of tableSource.pageData$ | async">
                <puibe-table-cell>{{item.id}}</puibe-table-cell>
                <puibe-table-cell align='right'>{{item.name}}</puibe-table-cell>
                <puibe-table-cell>{{item.created | date}}</puibe-table-cell>
            </puibe-table-row>
        </puibe-table>`,
    }),
};

export const RightAlignmentTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class="w-full">
            <puibe-table-column class="w-1/2">H1</puibe-table-column>
            <puibe-table-column class="w-5/12" align='right'>H2</puibe-table-column>
            <puibe-table-column class="w-1/12" align='right'>H3 H3H3H3</puibe-table-column>

            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell align='right'>A2</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
            </puibe-table-row>

            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell align='right'>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
            </puibe-table-row>   
        </puibe-table>`,
    }),
};

export const CustomBorderTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class="w-full">
            <puibe-table-column >H1</puibe-table-column>

            <puibe-table-row [borderBottom]='false'>
                <puibe-table-cell>No Border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row>
                <puibe-table-cell>Normal</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderBottom]='false'>
                <puibe-table-cell>No border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderBottom]='false'>
                <puibe-table-cell>No border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderBottom]='false' [borderTop]='true'>
                <puibe-table-cell>Only top border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderBottom]='false'>
                <puibe-table-cell>No border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderTop]='true'>
                <puibe-table-cell>Bottom and top border</puibe-table-cell>
            </puibe-table-row>
            <puibe-table-row [borderBottom]='false'>
                <puibe-table-cell>No border</puibe-table-cell>
            </puibe-table-row>
        </puibe-table>`,
    }),
};

export const CellDirectiveTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class="w-full">
            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column align='right'>H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>

            <puibe-table-row [borderBottom]='false'>
                <td puibeTableCell>A1</td>
                <td puibeTableCell align='right'>A2</td>
                <td puibeTableCell>A3</td>
            </puibe-table-row>

            <puibe-table-row [borderBottom]='false'>
                <td puibeTableCell>B1</td>
                <td puibeTableCell align='center'>B2</td>
                <td puibeTableCell>B3</td>
            </puibe-table-row>   

            <puibe-table-row [borderTop]='true' class="font-medium">
                <td puibeTableCell>C1</td>
                <td puibeTableCell align='left'>C2</td>
                <td puibeTableCell>C3</td>
            </puibe-table-row>
        </puibe-table>`,
    }),
};

export const CellInFooterTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class="w-full">
            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column align='right'>H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>

            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell align='right'>A2</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
            </puibe-table-row>

            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell align='center'>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
            </puibe-table-row>   
            <puibe-table-footer>
                <puibe-table-row [borderBottom]='false' class="bg-sand">
                    <puibe-table-cell>AB1</puibe-table-cell>
                    <puibe-table-cell align='left'>AB2</puibe-table-cell>
                    <puibe-table-cell>AB3</puibe-table-cell>
                </puibe-table-row>
            </puibe-table-footer>
        </puibe-table>`,
    }),
};

export const Celspan2WithDirectiveTable: Story = {
    render: (_args) => ({
        template: `
        <puibe-table class="w-full">
            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column align='right'>H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>

            <puibe-table-row>
                <td puibeTableCell colspan='2'>A1</td>
                <td puibeTableCell>A3</td>
            </puibe-table-row>

            <puibe-table-row>
                <td puibeTableCell>B1</td>
                <td puibeTableCell align='right'>B2</td>
                <td puibeTableCell>B3</td>
            </puibe-table-row>
        </puibe-table>`,
    }),
};
