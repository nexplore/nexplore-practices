import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
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
    constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: Data) {}
}
