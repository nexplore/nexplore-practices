import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-go-next',
    imports: [NgClass],
    template: `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Ebene_1"
        x="0px"
        y="0px"
        viewBox="0 0 32 24"
        style="enable-background:new 0 0 32 24;"
        xml:space="preserve"
    >
        <path
            [ngClass]="fillClassName"
            id="right-arrow-white"
            d="M21,2.2c-0.4-0.4-1-0.4-1.4-0.1c-0.4,0.4-0.4,1-0.1,1.4l0,0l7.4,7.4H2.6c-0.6,0-1,0.4-1,1l0,0  c0,0.6,0.5,1,1,1l0,0h24.3l-7.4,7.4c-0.4,0.4-0.4,1,0,1.5c0.4,0.4,1,0.4,1.4,0l0,0l9.1-9.1c0.4-0.4,0.4-1,0-1.4l0,0L21,2.2z"
        />
    </svg>`,
})
export class PuibeIconGoNextComponent extends PuibeIconDirectiveBase {
    /**
     * @deprecated
     * TODO: Remove (not needed)
     */
    @Input()
    fillClassName: string;
}
