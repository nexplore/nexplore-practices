import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PuiIconDirectiveBase } from './icon.directive';

@Component({
    standalone: true,
    selector: 'pui-icon-spinner',
    imports: [NgClass],
    template: `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="m-auto min-w-[12px] max-w-[4rem]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
    >
        <g transform="translate(82,50)">
            <g transform="rotate(0)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="1">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.8571428571428571s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.8571428571428571s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(69.95167365947947,75.01860743897694)">
            <g transform="rotate(51.42857142857143)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.8571428571428571">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.7142857142857143s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.7142857142857143s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(42.87933011339794,81.19769318981835)">
            <g transform="rotate(102.85714285714286)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.7142857142857143">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.5714285714285714s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.5714285714285714s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(21.16899622712259,63.884279651761865)">
            <g transform="rotate(154.2857142857143)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.5714285714285714">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.42857142857142855s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.42857142857142855s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(21.168996227122587,36.11572034823814)">
            <g transform="rotate(205.71428571428572)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.42857142857142855">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.2857142857142857s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.2857142857142857s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(42.879330113397934,18.802306810181648)">
            <g transform="rotate(257.1428571428571)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.2857142857142857">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="-0.14285714285714285s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="-0.14285714285714285s"
                    />
                </circle>
            </g>
        </g>
        <g transform="translate(69.95167365947947,24.981392561023043)">
            <g transform="rotate(308.5714285714286)">
                <circle cx="0" cy="0" r="6" [ngClass]="fillClassName" fill-opacity="0.14285714285714285">
                    <animateTransform
                        attributeName="transform"
                        type="scale"
                        begin="0s"
                        values="1.54 1.54;1 1"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="fill-opacity"
                        keyTimes="0;1"
                        dur="1s"
                        repeatCount="indefinite"
                        values="1;0"
                        begin="0s"
                    />
                </circle>
            </g>
        </g>
    </svg>`,
})
export class PuiIconSpinnerComponent extends PuiIconDirectiveBase {
    /**
     * @deprecated
     * TODO: Remove (not needed)
     */
    @Input()
    fillClassName = '';
}

