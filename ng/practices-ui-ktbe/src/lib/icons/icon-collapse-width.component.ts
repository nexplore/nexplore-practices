import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-collapse-width',
    template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M20.7083 12H14L16.875 9.125"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M16.875 14.875L14 12"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M3 12H9.70833L6.83333 9.125"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M6.83331 14.875L9.70831 12"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M3.375 6.25V5.29167C3.375 4.78333 3.57693 4.29582 3.93638 3.93638C4.29582 3.57693 4.78333 3.375 5.29167 3.375H18.7083C19.2167 3.375 19.7042 3.57693 20.0636 3.93638C20.4231 4.29582 20.625 4.78333 20.625 5.29167V6.25"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M3.375 17.75V18.7083C3.375 19.2167 3.57693 19.7042 3.93638 20.0636C4.29582 20.4231 4.78333 20.625 5.29167 20.625H18.7083C19.2167 20.625 19.7042 20.4231 20.0636 20.0636C20.4231 19.7042 20.625 19.2167 20.625 18.7083V17.75"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg> `,
})
export class PuibeIconCollapseWidthComponent extends PuibeIconDirectiveBase {}
