import { NgClass } from '@angular/common';
import { Component, HostBinding } from '@angular/core';

@Component({
    selector: 'puibe-calendar-toolbar',
    templateUrl: './calendar-toolbar.component.html',
    standalone: true,
    imports: [NgClass],
})
export class PuibeCalendarToolbarComponent {
    @HostBinding('class')
    readonly className = 'flex items-center justify-between gap-1';
}
