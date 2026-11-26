import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { PracticesKtbeDialogModule, PuibeButtonDirective } from '@nexplore/practices-ui-ktbe';

interface Data {
    name: string;
}

@Component({
    standalone: true,
    selector: 'app-modal',
    templateUrl: 'modal.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PracticesKtbeDialogModule, PuibeButtonDirective],
})
export class AppModalComponent {
    constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: Data) {}
}
