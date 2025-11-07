
import { Component, HostBinding } from '@angular/core';

@Component({
    selector: 'pui-calendar-toolbar',
    templateUrl: './calendar-toolbar.component.html',
    standalone: true,
    imports: [],
})
export class PuiCalendarToolbarComponent {
    @HostBinding('class')
    readonly className = 'flex items-center justify-between gap-1';
}

