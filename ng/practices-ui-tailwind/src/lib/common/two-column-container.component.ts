import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';

@Component({
    standalone: true,
    selector: 'pui-two-column',
    templateUrl: './two-column-container.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
})
export class PuiTwoColumnLayoutComponent {
    @HostBinding('class') className = 'block';

    @Input() mobileOrder: 'right first' | 'left first' = 'right first';

    @Input() horizontalDistribution: '50/50' | '66/33' = '66/33';

    @ViewChild('left') leftColumnContent: ElementRef<HTMLDivElement> | null = null;

    @ViewChild('right') rightColumnContent: ElementRef<HTMLDivElement> | null = null;

    _mobileOrderMap = {
        'right first': {
            right: 'order-1 md:order-2 mb-4 md:mb-0 md:pl-4',
            left: 'order-2 md:order-1',
        },
        'left first': { left: 'mb-4 md:mb-0', right: 'md:pl-4' },
    };

    _horizontalDistributionMap = {
        '50/50': { left: 'md:basis-1/2', right: 'md:basis-1/2' },
        '66/33': { left: 'md:basis-8/12', right: 'md:basis-4/12' },
    };
}

