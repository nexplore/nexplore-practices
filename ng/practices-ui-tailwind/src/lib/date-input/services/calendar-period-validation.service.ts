import { Injectable, inject } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { CalendarPeriodType, PuiCalendarPeriodService } from './calendar-period.service';

const partialDateRegexPattern = {
    date: '^\\d{1,2}(?:\\.|$)(?:\\d{1,2}|$)(?:\\.|$)(?:\\d{2,4}|$)$',
    month: '^\\d{1,2}(?:\\.|$)(?:\\d{2,4}|$)$',
    year: '^\\d{1,4}$',
};

const fullDateRegexPattern = {
    date: '^\\d{1,2}\\.\\d{1,2}\\.\\d{2,4}$',
    month: '^\\d{1,2}\\.\\d{2,4}$',
    year: '^\\d{2,4}$',
};

@Injectable({ providedIn: 'root' })
export class PuiCalendarPeriodValidationService {
    private readonly _calendarPeriodService = inject(PuiCalendarPeriodService);

    validateMinMax(
        value: Date,
        config: { periodType: CalendarPeriodType; min?: Date; max?: Date },
    ): ValidationErrors | null {
        if (value) {
            if (config.min && value < config.min) {
                return {
                    minDate: { min: this._calendarPeriodService.format(config.periodType, config.min) },
                };
            }
            if (config.max && value > config.max) {
                return {
                    maxDate: { max: this._calendarPeriodService.format(config.periodType, config.max) },
                };
            }
        }

        return null;
    }

    validateInputForPartialValue(
        inputEl: HTMLInputElement,
        config: { periodType: CalendarPeriodType },
    ): ValidationErrors | null {
        if (
            inputEl.value?.length > 0 &&
            this._inputHasWrongDateFormat(inputEl.value, config.periodType) &&
            this._inputHasWrongPartialDateFormatOrIsNotFocused(inputEl, config.periodType)
        ) {
            return {
                invalidDatePattern: { format: this._calendarPeriodService.getFormatPlaceholder(config.periodType) },
            };
        }

        return null;
    }

    private _inputHasWrongPartialDateFormatOrIsNotFocused(inputEl: HTMLInputElement, periodType: CalendarPeriodType) {
        return (
            document.activeElement !== inputEl ||
            false === new RegExp(partialDateRegexPattern[periodType]).test(inputEl.value)
        );
    }

    private _inputHasWrongDateFormat(inputValue: string, periodType: CalendarPeriodType) {
        return false === new RegExp(fullDateRegexPattern[periodType])?.test(inputValue);
    }
}

