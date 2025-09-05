import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { PuibeCalendarToolbarComponent } from './calendar-toolbar.component';

@Component({
    selector: 'puibe-calendar-grid-layout',
    standalone: true,
    imports: [PuibeCalendarToolbarComponent],
    templateUrl: './calendar-grid-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeCalendarGridLayoutComponent {
    @HostBinding('class')
    readonly className =
        'grid grid-cols-[10rem_auto_1fr_auto] max-sm:grid-cols-[12rem_1fr_auto] grid-rows-[auto_1fr] gap-2 px-4 flex-1';
}
