import { Component, HostBinding, Input } from '@angular/core';
import { PuibeIconDirectiveBase } from './icon.directive';
import { IconSize } from './icon.interface';

@Component({
    standalone: true,
    selector: 'puibe-icon-enumeration',
    template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31">
        <g>
            <circle cx="15.5" cy="15.5" r="15.5" />
            <text
                class="fill-[currentColor] font-medium"
                x="50%"
                y="50%"
                dominant-baseline="middle"
                text-anchor="middle"
            >
                <ng-content></ng-content>
            </text>
        </g>
    </svg>`,
})
export class PuibeIconEnumerationComponent extends PuibeIconDirectiveBase {
    @Input()
    color: 'sand' | 'anthrazit' | 'red' | 'green';

    // TODO: Should default for all be inline-flex?
    className = 'overflow-hidden text-ellipsis whitespace-nowrap inline-flex ';

    @HostBinding('class')
    get computedClass() {
        let className = '';
        switch (this.color) {
            default:
            case 'sand':
                className = 'fill-sand text-black';
                break;
            case 'anthrazit':
                className = 'fill-anthrazit text-white';
                break;
            case 'red':
                className = 'fill-red text-white';
                break;
            case 'green':
                className = 'fill-green text-white';
                break;
        }

        return className + ' ' + this.className;
    }

    override getSizeClasses() {
        return {
            ...super.getSizeClasses(),
            'h-8 w-8': this.size === IconSize.NONE,
        };
    }
}
