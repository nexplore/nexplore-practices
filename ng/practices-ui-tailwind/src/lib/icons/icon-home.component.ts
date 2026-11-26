import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-home',
    template: `<svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 20 20"
        xml:space="preserve"
    >
        <g>
            <path d="M8.4,17v-4.9h3.3V17h4.1v-6.6h2.5L10,3l-8.2,7.4h2.5V17H8.4z" />
        </g>
    </svg> `,
})
export class PuiIconHomeComponent extends PuiIconDirectiveBase {}

