import { Directive, inject } from '@angular/core';

import { PuibeCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { PuibeCalendarPickerInputDirective } from './calendar-picker-input.directive';

@Directive({
    standalone: true,
    selector: 'input[puibeInput][type="year"]',
    hostDirectives: [PuibeCalendarPickerAnchorDirective.HOST_DIRECTIVE_FOR_INPUT, PuibeCalendarPickerInputDirective],
})
export class PuibeYearInputDirective {
    constructor() {
        const picker = inject(PuibeCalendarPickerInputDirective, { self: true });

        picker.configure({
            type: 'year',
            helpDescriptionKey: 'Labels_DatePicker_HelpDescription_Year',
            getModelValueHandler: (date: Date) => date?.getFullYear(),
            calendarAllowedViewModes: ['year'],
        });
    }
}
