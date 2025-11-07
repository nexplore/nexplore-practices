import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    PracticesTailwindDefaultModule,
    PracticesTailwindFormComponentsModule,
    PuiButtonDirective,
    PuiIconEnumerationComponent,
    PuiModalComponent,
    PuiModalContentDirective,
    PuiModalFooterActionDirective,
    PuiModalSubtitleDirective,
    PuiModalTitleDirective,
    PuiSelectDirective,
} from '@nexplore/practices-ui-tailwind';
import { NgSelectModule } from '@ng-select/ng-select';
import { SampleListEntry, SampleType } from './table-example.component';

@Component({
    standalone: true,
    selector: 'app-table-detail-modal',
    templateUrl: 'detail-modal.component.html',
    imports: [
    PuiModalComponent,
    PuiModalContentDirective,
    PuiModalTitleDirective,
    PuiModalSubtitleDirective,
    PuiModalFooterActionDirective,
    PuiButtonDirective,
    PuiIconEnumerationComponent,
    PracticesTailwindDefaultModule,
    NgSelectModule,
    PracticesTailwindFormComponentsModule,
    PuiSelectDirective
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

