import { Component, HostBinding, Input } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';
import { IconSize } from './icon.interface';

@Component({
    standalone: true,
    selector: 'pui-icon-enumeration',
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
export class PuiIconEnumerationComponent extends PuiIconDirectiveBase {
    @Input()
    color: 'highlight' | 'bgdark' | 'red' | 'green';

    // TODO: Should default for all be inline-flex?
    className = 'overflow-hidden text-ellipsis whitespace-nowrap inline-flex ';

    @HostBinding('class')
    get computedClass() {
        let className = '';
        switch (this.color) {
            default:
            case 'highlight':
                className = 'fill-highlight text-black';
                break;
            case 'bgdark':
                className = 'fill-bgdark text-white';
                break;
            case 'red':
                className = 'fill-brand text-white';
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

