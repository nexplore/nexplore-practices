import { Injectable, inject } from '@angular/core';
import { Duration } from 'date-fns/types';
import { DateService } from '../../date.service';
import { CalendarPeriodType, PuiCalendarPeriodService } from './calendar-period.service';
import { PuiCalendarYearViewService } from './calendar-year-view.service';

@Injectable({
    providedIn: 'root',
})
export class PuiCalendarKeyboardNavigationService {
    private _dateService = inject(DateService);
    private _calendarYearViewService = inject(PuiCalendarYearViewService);
    private _calendarPeriodService = inject(PuiCalendarPeriodService);

    /**
     * Reads the passed keyboard-`event` and depending on the key (eg. ARROW-keys, PAGE_UP...), adds or remove certain time-period to the passed `startDate`.
     *
     * @param periodType The calendar period type to operate in (to change years, months, or days)
     * @param startDate The start date to modify
     * @param event The Keyboard event
     * @returns The modified date
     */
    navigateDateByKeyboard(periodType: CalendarPeriodType, startDate: Date, event: KeyboardEvent): Date {
        let horizontalUnit: keyof Duration;
        let verticalUnit: keyof Duration;
        let pageUnit: keyof Duration;
        let verticalSkipAmount = 1;
        let pageSkipAmount = 1;
        switch (periodType) {
            case 'month':
                horizontalUnit = 'months';
                verticalUnit = 'months';
                verticalSkipAmount = 3;
                pageUnit = 'years';
                pageSkipAmount = event.shiftKey ? 10 : 1;
                break;
            case 'year':
                horizontalUnit = 'years';
                verticalUnit = 'years';
                verticalSkipAmount = this._calendarYearViewService.yearsPerRow;
                pageUnit = 'years';
                pageSkipAmount = this._calendarYearViewService.yearsPerView;
                break;
            default:
            case 'date':
                horizontalUnit = 'days';
                verticalUnit = 'weeks';
                pageUnit = event.shiftKey ? 'years' : 'months';
                break;
        }

        let newDate: Date = startDate;
        switch (event.code) {
            case 'ArrowLeft':
                newDate = this._dateService.getDateWithAddition(startDate, { [horizontalUnit]: -1 });
                break;
            case 'ArrowRight':
                newDate = this._dateService.getDateWithAddition(startDate, { [horizontalUnit]: 1 });
                break;
            case 'ArrowUp':
                newDate = this._dateService.getDateWithAddition(startDate, {
                    [verticalUnit]: -1 * verticalSkipAmount,
                });
                break;
            case 'ArrowDown':
                newDate = this._dateService.getDateWithAddition(startDate, {
                    [verticalUnit]: 1 * verticalSkipAmount,
                });
                break;
            case 'Home':
                newDate = this._calendarPeriodService.getFirstItemOfPeriod(periodType, {
                    year: startDate.getFullYear(),
                    month: startDate.getMonth(),
                });
                break;
            case 'End':
                newDate = this._calendarPeriodService.getLastItemOfPeriod(periodType, {
                    year: startDate.getFullYear(),
                    month: startDate.getMonth(),
                });
                break;
            case 'PageUp':
                newDate = this._dateService.getDateWithAddition(startDate, {
                    [pageUnit]: -1 * pageSkipAmount,
                });
                break;
            case 'PageDown':
                newDate = this._dateService.getDateWithAddition(startDate, {
                    [pageUnit]: 1 * pageSkipAmount,
                });
                break;
        }
        return newDate;
    }
}

