import { Directive, Input, inject } from '@angular/core';
import { endOfDay } from 'date-fns/endOfDay';
import { lastDayOfMonth } from 'date-fns/lastDayOfMonth';

import { PuiCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuiCalendarPickerInputDirective } from './calendar-picker-input.directive';

@Directive({
    standalone: true,
    selector: 'input[puiInput][type="month"]',
    hostDirectives: [PuiCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuiCalendarPickerInputDirective],
})
export class PuiMonthInputDirective {
    /** If `true`, the form model value will always be a Date object with the last day of the respective month. */
    @Input()
    endOfMonth = false;

    constructor() {
        const picker = inject(PuiCalendarPickerInputDirective, { self: true });

        picker.configure({
            type: 'month',
            calendarAllowedViewModes: ['month', 'year'],
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription_Month',
            getModelValueHandler: (date) => (this.endOfMonth && date ? endOfDay(lastDayOfMonth(date)) : date),
        });
    }
}

