import { Component, EventEmitter, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { A11yModule } from '@angular/cdk/a11y';
import { PuiIconCloseComponent } from '../../icons/icon-close.component';
import { PuiCalendarComponent } from './calendar.component';
import { PuiCalendarToolbarItemDirective } from './presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'pui-calendar-flyout',
    templateUrl: './calendar-flyout.component.html',
    standalone: true,
    imports: [
        PuiCalendarComponent,
        PuiCalendarToolbarItemDirective,
        A11yModule,
        TranslateModule,
        PuiIconCloseComponent,
    ],
    providers: [],
})
export class PuiCalendarFlyoutComponent {
    @ViewChild(PuiCalendarComponent, { static: true }) readonly calendar: PuiCalendarComponent;

    readonly cancelClick = new EventEmitter<void>();
}

