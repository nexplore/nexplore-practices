import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';
import { IconDirection } from './icon.interface';

@Component({
    standalone: true,
    selector: 'pui-icon-arrow-right',
    template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 25">
        <path
            d="M1.80078 3.09922L11.4008 12.4992L1.80078 21.8992L3.20078 23.2992L14.2008 12.4992L3.20078 1.69922L1.80078 3.09922Z"
        />
    </svg>`,
})
export class PuiIconArrowRightComponent extends PuiIconDirectiveBase {
    protected override baseDirection: IconDirection = IconDirection.RIGHT;
}

