import { Directive, Self } from '@angular/core';

import { PuibeCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuibeCalendarPickerInputDirective } from './calendar-picker-input.directive';

// TODO: Find a way to reuse more code for date-,month-, and year- input directives
@Directive({
    standalone: true,
    selector: 'input[puibeInput][type="date"]',
    hostDirectives: [PuibeCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuibeCalendarPickerInputDirective],
})
export class PuibeDateInputDirective {
    constructor(@Self() picker: PuibeCalendarPickerInputDirective) {
        picker.configure({
            type: 'date',
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription',
            calendarAllowedViewModes: ['date', 'month', 'year'],
        });
    }
}
