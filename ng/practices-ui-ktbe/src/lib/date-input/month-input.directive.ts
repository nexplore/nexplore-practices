import { Directive, Input, Self } from '@angular/core';
import { endOfDay } from 'date-fns/endOfDay';
import { lastDayOfMonth } from 'date-fns/lastDayOfMonth';

import { PuibeCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuibeCalendarPickerInputDirective } from './calendar-picker-input.directive';

@Directive({
    standalone: true,
    selector: 'input[puibeInput][type="month"]',
    hostDirectives: [PuibeCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuibeCalendarPickerInputDirective],
})
export class PuibeMonthInputDirective {
    /** If `true`, the form model value will always be a Date object with the last day of the respective month. */
    @Input()
    endOfMonth = false;

    constructor(@Self() picker: PuibeCalendarPickerInputDirective) {
        picker.configure({
            type: 'month',
            calendarAllowedViewModes: ['month', 'year'],
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription_Month',
            getModelValueHandler: (date) => (this.endOfMonth && date ? endOfDay(lastDayOfMonth(date)) : date),
        });
    }
}
