import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

export type Alignment = 'right' | 'left';

@Component({
    selector: 'puibe-timeline',
    standalone: true,
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            :where(puibe-timeline) {
                @apply flex flex-col gap-4;
            }

            :where(puibe-timeline) > :where(puibe-timeline-item):last-child .connecting-line {
                @apply hidden;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTimelineComponent {
    public readonly alignmentSignal = input<Alignment>('left', { alias: 'alignment' });
}
