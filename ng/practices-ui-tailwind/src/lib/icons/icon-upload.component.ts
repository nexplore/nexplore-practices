import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-upload',
    template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 59">
        <g transform="translate(-848 -1910)">
            <g transform="translate(-383 -881)">
                <path
                    d="M64.546,337.1a2.024,2.024,0,0,1-2.024,2.024H42.258a2.024,2.024,0,0,1-2.024-2.024V326H38.2v11.1a4.056,4.056,0,0,0,4.053,4.053H62.517A4.056,4.056,0,0,0,66.57,337.1V326H64.546Z"
                    transform="translate(1207.8 2493.622)"
                />
                <path
                    d="M15.81,14.924a1.007,1.007,0,0,0-1.43,0L9.066,20.238V1.012a1.012,1.012,0,1,0-2.024,0V20.238L1.728,14.924A1.011,1.011,0,0,0,.3,16.354l6.993,6.988a.994.994,0,0,0,.768.286.994.994,0,0,0,.768-.286l6.988-6.988A1.012,1.012,0,0,0,15.81,14.924Z"
                    transform="translate(1268.242 2828.63) rotate(180)"
                />
            </g>
        </g>
    </svg>`,
})
export class PuiIconUploadComponent extends PuiIconDirectiveBase {}

