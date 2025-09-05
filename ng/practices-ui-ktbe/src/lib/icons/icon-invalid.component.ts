import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-invalid',
    styles: [
        `
            .cls-1 {
                fill: theme('colors.red');
            }

            .cls-2 {
                fill: theme('colors.white');
            }
        `,
    ],
    template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31">
        <g id="Gruppe_1335" data-name="Gruppe 1335" transform="translate(-285 -837)">
            <circle
                id="Ellipse_85"
                data-name="Ellipse 85"
                class="cls-1"
                cx="15.5"
                cy="15.5"
                r="15.5"
                transform="translate(285 837)"
            />
            <path
                id="Pfad_286"
                data-name="Pfad 286"
                class="cls-2"
                d="M4.477-6.027H2.027l-.27-12.035h3Zm-2.8,4.68a1.512,1.512,0,0,1,.434-1.107,1.587,1.587,0,0,1,1.184-.439,1.587,1.587,0,0,1,1.184.439A1.512,1.512,0,0,1,4.91-1.348,1.485,1.485,0,0,1,4.488-.27a1.591,1.591,0,0,1-1.2.434A1.591,1.591,0,0,1,2.1-.27,1.485,1.485,0,0,1,1.676-1.348Z"
                transform="translate(297.324 861.063)"
            />
        </g>
    </svg>`,
})
export class PuibeIconInvalidComponent extends PuibeIconDirectiveBase {}
