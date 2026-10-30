import { NgClass, NgIf } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
    PuibeIconCloseComponent,
    PuibeIconLoginComponent,
    PuibeToastActionDirective,
    PuibeToastComponent,
} from '@nexplore/practices-ui-ktbe';

@Component({
    standalone: true,
    selector: 'app-toasts',
    templateUrl: './toasts.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        NgClass,
        NgIf,
        PuibeIconCloseComponent,
        PuibeIconLoginComponent,
        PuibeToastComponent,
        PuibeToastActionDirective,
    ],
})
export class ToastsComponent {
    visible = false;

    toggleDetails() {
        this.visible = !this.visible;
    }

    close() {
        console.log('implement custom closing logic here!');
    }
}
