import { Component } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';
import { IconDirection } from './icon.interface';

@Component({
    standalone: true,
    selector: 'pui-icon-arrow-breadcrumb',
    template: `<svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 30 20"
        xml:space="preserve"
    >
        <path
            d="M11.4,17.3c-0.3-0.3-0.3-0.8,0-1.1l6.2-6.2l-6.2-6.2c-0.3-0.3-0.3-0.8,0-1.1s0.7-0.3,1,0l6.7,6.7c0.1,0.1,0.2,0.3,0.2,0.5s-0.1,0.4-0.2,0.5l-6.6,6.9C12.2,17.6,11.7,17.6,11.4,17.3z"
        />
    </svg>`,
})
export class PuiIconArrowBreadcrumbComponent extends PuiIconDirectiveBase {
    override baseDirection = IconDirection.RIGHT;
}

