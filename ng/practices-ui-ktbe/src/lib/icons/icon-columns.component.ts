import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-columns',
    template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M5.29167 3.375H18.7083C18.7083 3.375 20.625 3.375 20.625 5.29167V18.7083C20.625 18.7083 20.625 20.625 18.7083 20.625H5.29167C5.29167 20.625 3.375 20.625 3.375 18.7083V5.29167C3.375 5.29167 3.375 3.375 5.29167 3.375Z"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M9.125 3.375V20.625"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path
            d="M14.875 3.375V20.625"
            stroke="black"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg> `,
})
export class PuibeIconColumnsComponent extends PuibeIconDirectiveBase {}
