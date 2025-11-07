import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    PracticesKtbeDefaultModule,
    PracticesKtbeFormComponentsModule,
    PuibeButtonDirective,
    PuibeIconEnumerationComponent,
    PuibeModalComponent,
    PuibeModalContentDirective,
    PuibeModalFooterActionDirective,
    PuibeModalSubtitleDirective,
    PuibeModalTitleDirective,
    PuibeSelectDirective,
} from '@nexplore/practices-ui-ktbe';
import { NgSelectModule } from '@ng-select/ng-select';
import { SampleListEntry, SampleType } from './table-example.component';

@Component({
    standalone: true,
    selector: 'app-table-detail-modal',
    templateUrl: 'detail-modal.component.html',
    imports: [
    PuibeModalComponent,
    PuibeModalContentDirective,
    PuibeModalTitleDirective,
    PuibeModalSubtitleDirective,
    PuibeModalFooterActionDirective,
    PuibeButtonDirective,
    PuibeIconEnumerationComponent,
    PracticesKtbeDefaultModule,
    NgSelectModule,
    PracticesKtbeFormComponentsModule,
    PuibeSelectDirective
],
})
export class AppTableDetailModalComponent {
    dialogRef = inject(DialogRef);
    data = inject<SampleListEntry>(DIALOG_DATA);

    private readonly _formBuilder = inject(FormBuilder);

    readonly form = this._formBuilder.group({
        name: this._formBuilder.control<string>(this.data.name),
        type: this._formBuilder.control<string>(this.data.type),
        active: this._formBuilder.control<boolean>(this.data.active),
    });

    readonly activeItems = [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
    ];

    readonly typeItems = [
        { label: 'Type 1', value: SampleType.Type1 },
        { label: 'Type 2', value: SampleType.Type2 },
        { label: 'Type 3', value: SampleType.Type3 },
    ];
}
