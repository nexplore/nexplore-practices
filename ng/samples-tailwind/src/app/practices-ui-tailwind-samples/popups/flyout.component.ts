import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
    PuiButtonDirective,
    PuiFlyoutComponent,
    PuiFlyoutContentDirective,
    PuiFlyoutFooterActionDirective,
    PuiFlyoutTitleDirective,
} from '@nexplore/practices-ui-tailwind';

interface Data {
    name: string;
}

@Component({
    standalone: true,
    selector: 'app-flyout',
    templateUrl: 'flyout.component.html',
    imports: [
        DialogModule,
        PuiFlyoutComponent,
        PuiFlyoutContentDirective,
        PuiFlyoutTitleDirective,
        PuiFlyoutFooterActionDirective,
        PuiButtonDirective,
    ],
})
export class AppFlyoutComponent {
    dialogRef = inject(DialogRef);
    data = inject<Data>(DIALOG_DATA);
}

