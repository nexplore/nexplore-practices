import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-file',
    template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0  24 25">
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.5 10C11.5 10.8284 12.1716 11.5 13 11.5H17.5V20H6.5V5.5H11.5V10ZM13 10V6.06066L16.9393 10H13ZM19 10V20.5C19 21.0523 18.5523 21.5 18 21.5H6C5.44772 21.5 5 21.0523 5 20.5V5C5 4.44772 5.44772 4 6 4H12H13H13.0607L19 9.93934L19 10Z"
            fill="currentColor"
        />
        <path d="M7.33334 13.3333H16.6667V14.5H7.33334V13.3333Z" fill="currentColor" />
        <path d="M7.33334 15.6667H12.3333V16.8333H7.33334V15.6667Z" fill="currentColor" />
    </svg> `,
})
export class PuibeIconFileComponent extends PuibeIconDirectiveBase {}
