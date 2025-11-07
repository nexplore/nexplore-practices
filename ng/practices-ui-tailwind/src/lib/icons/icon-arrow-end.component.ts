import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-arrow-end',
    template: ` <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 12 11"
        xml:space="preserve"
    >
        <path d="M10.7,0.9L6,5.7L1.3,0.9L0.6,1.6L6,7.1l5.4-5.5L10.7,0.9z" fill="currentColor" />
        <path d="M11,9L6,9L1,9L1,10L6,10l5,0L11,9z" fill="currentColor" />
    </svg>`,
})
export class PuiIconArrowEndComponent extends PuiIconDirectiveBase {}

