import { Directive, inject } from '@angular/core';

import { PuiCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuiCalendarPickerInputDirective } from './calendar-picker-input.directive';

@Directive({
    standalone: true,
    selector: 'input[puiInput][type="year"]',
    hostDirectives: [PuiCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuiCalendarPickerInputDirective],
})
export class PuiYearInputDirective {
    constructor() {
        const picker = inject(PuiCalendarPickerInputDirective, { self: true });

        picker.configure({
            type: 'year',
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription_Year',
            getModelValueHandler: (date: Date | null) => (date ? date.getFullYear() : null),
            calendarAllowedViewModes: ['year'],
        });
    }
}

