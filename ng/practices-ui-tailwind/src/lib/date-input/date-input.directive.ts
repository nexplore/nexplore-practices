import { Directive, inject } from '@angular/core';

import { PuiCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuiCalendarPickerInputDirective } from './calendar-picker-input.directive';

// TODO: Find a way to reuse more code for date-,month-, and year- input directives
@Directive({
    standalone: true,
    selector: 'input[puiInput][type="date"]',
    hostDirectives: [PuiCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuiCalendarPickerInputDirective],
})
export class PuiDateInputDirective {
    constructor() {
        const picker = inject(PuiCalendarPickerInputDirective, { self: true });

        picker.configure({
            type: 'date',
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription',
            calendarAllowedViewModes: ['date', 'month', 'year'],
        });
    }
}

