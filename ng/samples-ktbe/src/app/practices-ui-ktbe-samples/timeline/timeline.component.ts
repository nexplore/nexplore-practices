import { Component } from '@angular/core';
import {
    PuibeExpansionPanelComponent,
    PuibeTimelineComponent,
    PuibeTimelineItemComponent,
} from '@nexplore/practices-ui-ktbe';

@Component({
    standalone: true,
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    imports: [PuibeExpansionPanelComponent, PuibeTimelineItemComponent, PuibeTimelineComponent],
})
export class TimelineExampleComponent {}
