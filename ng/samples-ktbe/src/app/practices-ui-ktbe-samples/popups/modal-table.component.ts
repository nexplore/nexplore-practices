import { DialogRef } from '@angular/cdk/dialog';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    PracticesKtbeDialogModule,
    PracticesKtbeTableComponentsModule,
    PuibeButtonDirective,
    PuibeCheckboxComponent,
    PuibeSelectableDirective,
    PuibeSelectionDirective,
    PuibeTableSelectableDirective,
    PuibeTableSelectionDirective,
    TableViewSource,
} from '@nexplore/practices-ui-ktbe';
import { SampleModel, tableSampleLoadFn } from '../tables/tables.component';

@Component({
    standalone: true,
    selector: 'app-modal-table',
    templateUrl: 'modal-table.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        PracticesKtbeDialogModule,
        PracticesKtbeTableComponentsModule,
        PuibeSelectionDirective,
        PuibeSelectableDirective,
        PuibeTableSelectionDirective,
        PuibeTableSelectableDirective,
        PuibeButtonDirective,
        PuibeCheckboxComponent,
        FormsModule,
        AsyncPipe,
        DatePipe,
    ],
})
export class AppModalTableComponent {
    constructor(public dialogRef: DialogRef) {}

    selectedItem: SampleModel | null = null;

    enableContentScroll = true;

    useGridLayout = true;

    readonly tableSource = new TableViewSource<SampleModel>(
        {
            columns: ['id', 'name', 'created'],
        },
        (params) => tableSampleLoadFn(params, 300)
    );
}
