import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-go-back',
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
            id="_002-right-arrow-1"
            d="M11,21.8c0.4,0.4,1,0.4,1.4,0.1s0.4-1,0.1-1.4c0,0,0,0,0,0L5.1,13h24.3c0.6,0,1-0.4,1-1  c0,0,0,0,0,0c0-0.6-0.5-1-1-1c0,0,0,0,0,0H5.1l7.4-7.4c0.4-0.4,0.4-1,0-1.5c-0.4-0.4-1-0.4-1.4,0c0,0,0,0,0,0l-9.1,9.1  c-0.4,0.4-0.4,1,0,1.4c0,0,0,0,0,0L11,21.8z"
        />
    </svg>`,
})
export class PuibeIconGoBackComponent extends PuibeIconDirectiveBase {
    /**
     * @deprecated
     * TODO: Remove (not needed)
     */
    @Input()
    fillClassName: string;
}
