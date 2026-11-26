import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getDecade } from 'date-fns/getDecade';
import { getWeek } from 'date-fns/getWeek';
import { isValid } from 'date-fns/isValid';
import { lastDayOfMonth } from 'date-fns/lastDayOfMonth';
import { parse } from 'date-fns/parse';
import { DateFormat, DateService } from '../../date.service';
import { PuiCalendarYearViewService } from './calendar-year-view.service';

export interface CalendarPeriodItem {
    day: number;
    month: number;
    year: number;
    label: string;
    labelShort: string;
    isOtherPeriod: boolean;
    date: Date;
}

export interface CalendarPeriodRow {
    rowLabel?: string;
    rowLabelLong?: string;
    items: CalendarPeriodItem[];
}

export interface CalendarPeriodRowsPage {
    headers?: { long: string; short: string }[];
    rowLabelsHeader?: { long: string; short: string };
    rows: CalendarPeriodRow[];
}

export interface CalendarPeriod {
    year: number;
    month: number;
}

export type CalendarPeriodType = 'date' | 'month' | 'year';

export type DateInput = string | number | Date | null;

@Injectable({ providedIn: 'root' })
export class PuiCalendarPeriodService {
    private _dateService = inject(DateService);
    private _calendarYearViewService = inject(PuiCalendarYearViewService);
    private _translateService = inject(TranslateService);

    getFormatPlaceholder(type: CalendarPeriodType) {
        switch (type) {
            case 'month':
                return this._translateService.instant('Practices.Labels_DatePicker_Placeholder_Month');
            case 'year':
                return this._translateService.instant('Practices.Labels_DatePicker_Placeholder_Year');
            default:
            case 'date':
                return this._translateService.instant('Practices.Labels_DatePicker_Placeholder');
        }
    }

    format(type: CalendarPeriodType, date: Date) {
        if (!date || isNaN(date.getTime())) {
            return '';
        }
        switch (type) {
            case 'month':
                return this._dateService.format(date, DateFormat.MONTH_AND_YEAR);
            case 'year':
                return this._dateService.format(date, DateFormat.YEAR);
            default:
            case 'date':
                return this._dateService.format(date, DateFormat.DATE_DDMMYYYY);
        }
    }

    formatLong(type: CalendarPeriodType, date: Date) {
        if (!date || isNaN(date.getTime())) {
            return '';
        }
        switch (type) {
            case 'month':
                return this._dateService.format(date, DateFormat.MONTH_LONG_AND_YEAR);
            case 'year':
                return this._dateService.format(date, DateFormat.YEAR);
            default:
            case 'date':
                return this._dateService.format(date, DateFormat.DATE_LONG_MONTH_DAY_YEAR_AND_WEEKDAY);
        }
    }

    parse(
        type: CalendarPeriodType,
        inputText: DateInput,
        options: { strict?: boolean; referenceDate?: Date },
    ): Date | null {
        if (!inputText) {
            return null;
        }

        if (inputText instanceof Date) {
            const date = this.convertDateToFitPeriodType(type, inputText);
            if (isValid(date)) {
                return date;
            }
        }

        if (typeof inputText === 'number') {
            inputText = `${inputText}`;
        }

        if (typeof inputText === 'string') {
            let referenceDate = options.referenceDate ?? new Date();
            let date: Date | null = null;
            switch (type) {
                case 'month':
                    referenceDate = this._dateService.getDateWithReplaced(referenceDate, {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                    });

                    if (inputText.includes('.')) {
                        date = parse(inputText, 'MM.yyyy', referenceDate);
                    } else if (!options.strict) {
                        date = parse(inputText, 'yyyy', referenceDate);
                    }

                    if (!date || !isValid(date)) {
                        // Fallback parse full date
                        date = this._dateService.parse(inputText, referenceDate);
                    }

                    break;
                case 'year':
                    if (inputText.length === 4) {
                        date = new Date(+inputText, 0);
                    } else if (inputText.length <= 2) {
                        const century = Math.floor(getDecade(referenceDate) / 100) * 100;
                        const year = century + +inputText;
                        date = new Date(year, 0);
                    } else {
                        // Fallback parse full date
                        date = this._dateService.parse(inputText, referenceDate);
                    }
                    break;
                default:
                case 'date':
                    date = this._dateService.parse(inputText, referenceDate);

                    if (!options.strict && !isValid(date)) {
                        // Fallback is to parse month or year
                        if (inputText.includes('.')) {
                            date = parse(inputText, 'MM.yyyy', referenceDate);
                        } else {
                            date = parse(inputText, 'yyyy', referenceDate);
                        }
                    }

                    break;
            }

            if (date && isValid(date)) {
                return date;
            }
        }

        return null;
    }

    convertDateToFitPeriodType(type: CalendarPeriodType, date: Date) {
        switch (type) {
            case 'month':
                return new Date(date.getFullYear(), date.getMonth());
            case 'year':
                return new Date(date.getFullYear(), 0);
            default:
            case 'date':
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
    }

    dateMatchesPeriod(type: CalendarPeriodType, date: Date, period: CalendarPeriod) {
        switch (type) {
            case 'month':
                return date.getFullYear() === period.year;
            case 'year': {
                const year = date.getFullYear();
                return this._isYearWithinPeriod(type, period, year);
            }
            default:
            case 'date': {
                if (date.getMonth() === period.month) {
                    return true;
                }

                // If the month is not the same, we check whether the date is within the last or first week of the month
                const calendarWeek = getWeek(date);
                const firstMonthDay = new Date(period.year, period.month);
                if (calendarWeek === getWeek(firstMonthDay)) {
                    return true;
                }
                const lastMonthDay = lastDayOfMonth(firstMonthDay);
                if (calendarWeek === getWeek(lastMonthDay)) {
                    return true;
                }

                return false;
            }
        }
    }

    arePeriodsEqual(type: CalendarPeriodType, period1: CalendarPeriod, period2: CalendarPeriod) {
        switch (type) {
            case 'month':
                return period1.year === period2.year;
            case 'year':
                return this._isYearWithinPeriod(type, period1, period2.year);
            default:
            case 'date':
                return period1.year === period2.year && period1.month === period2.month;
        }
    }

    getFirstItemOfPeriod(type: string, period: CalendarPeriod): Date {
        switch (type) {
            case 'month':
                return new Date(period.year, 0);
            case 'year':
                return new Date(this._calendarYearViewService.getStartDecade(period.year), 0);
            default:
            case 'date':
                return new Date(period.year, period.month, 1);
        }
    }

    getLastItemOfPeriod(type: string, period: CalendarPeriod): Date {
        switch (type) {
            case 'month':
                return new Date(period.year, 11);
            case 'year':
                return new Date(this._calendarYearViewService.getEndDecade(period.year), 0);
            default:
            case 'date':
                return lastDayOfMonth(new Date(period.year, period.month));
        }
    }

    moveNextPeriod(type: CalendarPeriodType, period: CalendarPeriod) {
        switch (type) {
            case 'month':
                return { month: 0, year: period.year + 1 };
            case 'year':
                return { month: 0, year: period.year + this._calendarYearViewService.yearsPerView };
            default:
            case 'date':
                if (period.month === 11) {
                    return { year: period.year + 1, month: 0 };
                } else {
                    return { ...period, month: period.month + 1 };
                }
        }
    }

    movePrevPeriod(type: CalendarPeriodType, period: CalendarPeriod) {
        switch (type) {
            case 'month':
                return { month: 11, year: period.year - 1 };
            case 'year':
                return { month: 0, year: period.year - this._calendarYearViewService.yearsPerView };
            default:
            case 'date':
                if (period.month === 0) {
                    return { year: period.year - 1, month: 11 };
                } else {
                    return { ...period, month: period.month - 1 };
                }
        }
    }

    private _isYearWithinPeriod(type: string, period: CalendarPeriod, year: number) {
        const start = this.getFirstItemOfPeriod(type, period).getFullYear();
        const end = start + this._calendarYearViewService.yearsPerView;
        return year >= start && year <= end;
    }
}

