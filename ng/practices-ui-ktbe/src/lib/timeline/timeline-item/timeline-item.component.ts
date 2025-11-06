import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Alignment, PuibeTimelineComponent } from '../timeline.component';

@Component({
    selector: 'puibe-timeline-item',
    imports: [NgClass],
    standalone: true,
    templateUrl: './timeline-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeTimelineItemComponent {
    private readonly _timeline = inject(PuibeTimelineComponent, { optional: true });

    public readonly alignmentSignal = input<Alignment | null>(null, { alias: 'alignment' });

    protected get alignment(): Alignment {
        return this.alignmentSignal() ?? this._timeline?.alignmentSignal() ?? 'left';
    }
}
