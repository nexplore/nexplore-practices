import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
    PuibeExpansionPanelComponent,
    PuibeTimelineComponent,
    PuibeTimelineItemComponent,
} from '@nexplore/practices-ui-ktbe';

@Component({
    standalone: true,
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PuibeExpansionPanelComponent, PuibeTimelineItemComponent, PuibeTimelineComponent],
})
export class TimelineExampleComponent {}
