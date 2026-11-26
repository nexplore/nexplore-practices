
import { Component } from '@angular/core';
import {
  PuiIconLoginComponent,
  PuiToastActionDirective,
  PuiToastComponent
} from '@nexplore/practices-ui-tailwind';

@Component({
    standalone: true,
    selector: 'app-toasts',
    templateUrl: './toasts.component.html',
    imports: [PuiIconLoginComponent, PuiToastComponent, PuiToastActionDirective],
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

