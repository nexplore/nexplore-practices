import { Component } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'puibe-icon-list-item-rect',
    template: `<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="6" height="6" fill="#EA161F" />
    </svg> `,
})
export class PuibeIconListItemRectComponent extends PuibeIconDirectiveBase {}
