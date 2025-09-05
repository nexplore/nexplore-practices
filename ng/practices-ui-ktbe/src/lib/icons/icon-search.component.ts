import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-search',
    template: `<svg
        version="1.1"
        id="Ebene_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 368 368"
        style="enable-background:new 0 0 368 368;"
        xml:space="preserve"
    >
        <path
            d="M296.7,272.4L236.3,212c24.8-34.8,21.6-83.3-9.5-114.5c-34.8-34.8-91.2-34.8-125.9,0s-34.8,91.2,0,125.9
                        c31.2,31.2,79.7,34.3,114.5,9.5l60.4,60.4c5.8,5.8,15.2,5.8,21,0C302.5,287.6,302.5,278.2,296.7,272.4z M121.8,202.4
                        c-23.2-23.2-23.2-60.8,0-84s60.8-23.2,84,0s23.2,60.8,0,84S145,225.6,121.8,202.4z"
        />
    </svg> `,
})
export class PuibeIconSearchComponent extends PuibeIconDirectiveBase {}
