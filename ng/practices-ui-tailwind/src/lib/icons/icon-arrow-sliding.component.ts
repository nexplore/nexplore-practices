import { Component } from '@angular/core';

import { PuiIconDirectiveBase } from './icon.directive';
import { IconDirection } from './icon.interface';

@Component({
    standalone: true,
    selector: 'pui-icon-arrow-sliding',
    template: ` <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 32 24"
        xml:space="preserve"
    >
        <path
            d="M21,2.2c-0.4-0.4-1-0.4-1.4-0.1c-0.4,0.4-0.4,1-0.1,1.4l0,0l7.4,7.4H2.6c-0.6,0-1,0.4-1,1l0,0  c0,0.6,0.5,1,1,1l0,0h24.3l-7.4,7.4c-0.4,0.4-0.4,1,0,1.5c0.4,0.4,1,0.4,1.4,0l0,0l9.1-9.1c0.4-0.4,0.4-1,0-1.4l0,0L21,2.2z"
            fill="currentColor"
        />
    </svg>`,
})
export class PuiIconArrowSlidingComponent extends PuiIconDirectiveBase {
    override baseDirection = IconDirection.RIGHT;
}

