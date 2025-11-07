import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type Alignment = 'right' | 'left';

@Component({
    selector: 'pui-timeline',
    standalone: true,
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            @reference '../../styles.css';
            :where(pui-timeline) {
                @apply flex flex-col gap-4;
            }

            :where(pui-timeline) > :where(pui-timeline-item):last-child .connecting-line {
                @apply hidden;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiTimelineComponent {
    public readonly alignmentSignal = input<Alignment>('left', { alias: 'alignment' });
}

