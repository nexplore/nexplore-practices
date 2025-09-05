import { Component, EventEmitter, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { A11yModule } from '@angular/cdk/a11y';
import { PuibeIconCloseComponent } from '../../icons/icon-close.component';
import { PuibeCalendarComponent } from './calendar.component';
import { PuibeCalendarToolbarItemDirective } from './presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'puibe-calendar-flyout',
    templateUrl: './calendar-flyout.component.html',
    standalone: true,
    imports: [
        PuibeCalendarComponent,
        PuibeCalendarToolbarItemDirective,
        A11yModule,
        TranslateModule,
        PuibeIconCloseComponent,
    ],
    providers: [],
})
export class PuibeCalendarFlyoutComponent {
    @ViewChild(PuibeCalendarComponent, { static: true }) readonly calendar: PuibeCalendarComponent;

    readonly cancelClick = new EventEmitter<void>();
}
