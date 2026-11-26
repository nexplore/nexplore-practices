import { Component } from '@angular/core';
import {
    PuiExpansionPanelComponent,
    PuiTimelineComponent,
    PuiTimelineItemComponent,
} from '@nexplore/practices-ui-tailwind';

@Component({
    standalone: true,
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    imports: [PuiExpansionPanelComponent, PuiTimelineItemComponent, PuiTimelineComponent],
})
export class TimelineExampleComponent {}

