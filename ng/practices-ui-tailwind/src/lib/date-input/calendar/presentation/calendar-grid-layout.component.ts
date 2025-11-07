import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { PuiCalendarToolbarComponent } from './calendar-toolbar.component';

@Component({
    selector: 'pui-calendar-grid-layout',
    standalone: true,
    imports: [PuiCalendarToolbarComponent],
    templateUrl: './calendar-grid-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiCalendarGridLayoutComponent {
    @HostBinding('class')
    readonly className =
        'grid grid-cols-[10rem_auto_1fr_auto] max-sm:grid-cols-[12rem_1fr_auto] grid-rows-[auto_1fr] gap-2 px-4 flex-1';
}

