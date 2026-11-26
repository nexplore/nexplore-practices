import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-edit',
    template: `<svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.1065 4.83807H5.13362C3.96936 4.83807 3.02554 5.78189 3.02554 6.94615V18.8919C3.02554 20.0562 3.96936 21 5.13362 21H17.0794C18.2437 21 19.1875 20.0562 19.1875 18.8919V12.919H17.7821V18.8919C17.7821 19.28 17.4675 19.5946 17.0794 19.5946H5.13362C4.74553 19.5946 4.43093 19.28 4.43093 18.8919V6.94615C4.43093 6.55806 4.74554 6.24345 5.13362 6.24345H11.1065V4.83807Z"
            fill="currentColor"
        />
        <path
            d="M16.2659 4.53895L19.4611 7.73409L11.7927 15.4024L8.59759 12.2073L16.2659 4.53895Z"
            fill="currentColor"
        />
        <path
            d="M16.9049 3.89992L20.1001 7.09506L20.7326 6.46252C21.0891 6.10601 21.0891 5.528 20.7326 5.17149L18.8285 3.26738C18.472 2.91087 17.894 2.91087 17.5375 3.26738L16.9049 3.89992Z"
            fill="currentColor"
        />
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 17L11.7927 15.4024L8.59759 12.2073L7 17ZM9.16117 15.327L10.1197 15.0075L8.99251 13.8803L8.673 14.8388L9.16117 15.327Z"
            fill="currentColor"
        />
    </svg> `,
})
export class PuiIconEditComponent extends PuiIconDirectiveBase {}

