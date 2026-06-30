import { Component, HostBinding } from '@angular/core';

@Component({
    standalone: true,
    selector: 'puibe-tooltip-icon',
    template: `<svg
        [class]="class"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        x="0px"
        y="0px"
        width="14px"
        height="24px"
        viewBox="0 0 14 24"
        enable-background="new 0 0 14 24"
        xml:space="preserve"
    >
        <polygon
            fill="white"
            stroke="#000000"
            stroke-width="1"
            stroke-miterlimit="10"
            points="0,12 7,0   14,12 7,24 "
        />
        <rect x="0" y="0" width="14" height="12" fill="white" />
    </svg>`,
})
export class PuibeTooltipIconComponent {
    @HostBinding('class') class = '';
}
