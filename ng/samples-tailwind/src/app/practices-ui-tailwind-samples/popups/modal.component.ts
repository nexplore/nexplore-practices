import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { PracticesTailwindDialogModule, PuiButtonDirective } from '@nexplore/practices-ui-tailwind';

interface Data {
    name: string;
}

@Component({
    standalone: true,
    selector: 'app-modal',
    templateUrl: 'modal.component.html',
    imports: [PracticesTailwindDialogModule, PuiButtonDirective],
})
export class AppModalComponent {
    dialogRef = inject(DialogRef);
    data = inject<Data>(DIALOG_DATA);
}

