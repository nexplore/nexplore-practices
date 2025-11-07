
import { Component, Input } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';
@Component({
    standalone: true,
    selector: 'puibe-icon-close',
    template: `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" [class]="colorClass">
        <path
            d="M17.8 0.799988L9.99999 8.59999L2.19999 0.799988L0.799988 2.19999L8.59999 9.99999L0.799988 17.8L2.19999 19.2L9.99999 11.4L17.8 19.2L19.2 17.8L11.4 9.99999L19.2 2.19999L17.8 0.799988Z"
        />
    </svg> `,
    imports: [],
})
export class PuibeIconCloseComponent extends PuibeIconDirectiveBase {
    /**
     * @deprecated
     * TODO: Remove (not needed)
     */
    @Input()
    colorClass: string;
}
