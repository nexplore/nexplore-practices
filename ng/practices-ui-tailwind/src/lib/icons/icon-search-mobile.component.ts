import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-search-mobile',
    template: `<svg
        version="1.1"
        id="Ebene_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 292 292"
        style="enable-background:new 0 0 292 292;"
        xml:space="preserve"
    >
        <path
            d="M255.7,241.4L195.3,181c24.8-34.8,21.6-83.3-9.5-114.5c-34.8-34.8-91.2-34.8-125.9,0s-34.8,91.2,0,125.9
                        c31.2,31.2,79.7,34.3,114.5,9.5l60.4,60.4c5.8,5.8,15.2,5.8,21,0C261.5,256.6,261.5,247.2,255.7,241.4z M80.8,171.4
                        c-23.2-23.2-23.2-60.8,0-84s60.8-23.2,84,0s23.2,60.8,0,84S104,194.6,80.8,171.4z"
        />
    </svg> `,
})
export class PuiIconSearchMobileComponent extends PuiIconDirectiveBase {}

