import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-explanation-mark',
    imports: [NgClass],
    template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4.731 21.563">
        <path
            [ngClass]="fillClassName"
            id="Pfad_284"
            data-name="Pfad 284"
            d="M5.933-6.548H2.417l-.5-14.78H6.431ZM4.175-4.233A2.372,2.372,0,0,1,5.9-3.6a2.143,2.143,0,0,1,.652,1.611A2.126,2.126,0,0,1,5.9-.4a2.372,2.372,0,0,1-1.721.63A2.352,2.352,0,0,1,2.468-.4a2.126,2.126,0,0,1-.652-1.6,2.149,2.149,0,0,1,.652-1.6A2.337,2.337,0,0,1,4.175-4.233Z"
            transform="translate(-1.816 21.328)"
        />
    </svg>`,
})
export class PuiIconExplanationMarkComponent extends PuiIconDirectiveBase {
    /* TODO: Remove */
    @Input()
    fillClassName = '';
}

