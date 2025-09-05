import { Component, Input } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-arrow',
    template: ` <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 12 8"
        xml:space="preserve"
        [class]="colorClass"
    >
        <path d="M10.7,0.9L6,5.7L1.3,0.9L0.6,1.6L6,7.1l5.4-5.5L10.7,0.9z" />
    </svg>`,
})
export class PuibeIconArrowComponent extends PuibeIconDirectiveBase {
    /**
     * @deprecated
     * TODO: Remove (not needed)
     */
    @Input()
    colorClass: string;
}
