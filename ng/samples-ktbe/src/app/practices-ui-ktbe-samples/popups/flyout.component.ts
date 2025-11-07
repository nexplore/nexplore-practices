import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
    PuibeButtonDirective,
    PuibeFlyoutComponent,
    PuibeFlyoutContentDirective,
    PuibeFlyoutFooterActionDirective,
    PuibeFlyoutTitleDirective,
} from '@nexplore/practices-ui-ktbe';

interface Data {
    name: string;
}

@Component({
    standalone: true,
    selector: 'app-flyout',
    templateUrl: 'flyout.component.html',
    imports: [
        DialogModule,
        PuibeFlyoutComponent,
        PuibeFlyoutContentDirective,
        PuibeFlyoutTitleDirective,
        PuibeFlyoutFooterActionDirective,
        PuibeButtonDirective,
    ],
})
export class AppFlyoutComponent {
    dialogRef = inject(DialogRef);
    data = inject<Data>(DIALOG_DATA);
}
