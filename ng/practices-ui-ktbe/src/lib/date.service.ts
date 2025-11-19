import { Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { add } from 'date-fns/add';
import { format } from 'date-fns/format';
import { getDaysInMonth } from 'date-fns/getDaysInMonth';
import { isValid } from 'date-fns/isValid';
import { Locale } from 'date-fns/types';
import { de, enUS, frCH } from 'date-fns/locale';
import { parse } from 'date-fns/parse';
import { parseISO } from 'date-fns/parseISO';
import { set } from 'date-fns/set';
import { setDay } from 'date-fns/setDay';
import { startOfWeek } from 'date-fns/startOfWeek';
import { startOfYear } from 'date-fns/startOfYear';
import { distinctUntilChanged, filter, startWith } from 'rxjs';

const dateParseFormats = ['d.M.yy', 'd.M.yyyy', 'dd-MM-yyyy'];

type DateInput = Date | string;

export type Duration = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
};

export enum DateFormat {
    /** 1, 2, ..., 12 */
    MONTH_NUMBER = 'M',
    /** 01, 02, ..., 12 */
    MONTH_NUMBER_LEADING_ZERO = 'MM',
    /** Jan, Feb, ..., Dec */
    MONTH_3DIGIT = 'MMM',
    /** J, F, ..., D */
    MONTH_1DIGIT = 'MMMMM',
    /** January, February, ..., December */
    MONTH_LONG = 'MMMM',

    MONTH_AND_YEAR = 'MM.yyyy',

    MONTH_LONG_AND_YEAR = 'MMMM yyyy',

    /** 2, 3, 4, ..., 1 */
    WEEKDAY_NUMBER = 'c',
    /** 2nd, 3rd, ..., 1st */
    WEEKDAY_NUMBER_ND = 'co',
    /** 02, 03, ..., 01 */
    WEEKDAY_NUMBER_LEADING_ZERO = 'cc',
    /* Mon, Tue, Wed, ..., Sun */
    WEEKDAY_3DIGIT = 'ccc',
    /** Monday, Tuesday, ..., Sunday */
    WEEKDAY_LONG = 'cccc',
    /** M, T, W, T, F, S, S */
    WEEKDAY_1DIGIT = 'ccccc',
    /** Mo, Tu, We, Th, Fr, Sa, Su */
    WEEKDAY_2DIGIT = 'cccccc',

    DATE_DMYY = 'd.M.yy',
    DATE_DDMMYYYY = 'dd.MM.yyyy',

    /** 04/29/1453 */
    DATE_DDMMYYYY_LOCALIZED = 'P',
    /** Apr 29, 1453 */
    DATE_ABBR_MONTH_DAY_YEAR = 'PP',
    /** April 29th, 1453 */
    DATE_LONG_MONTH_DAY_YEAR = 'PPP',
    /** Friday, April 29th, 1453 */
    DATE_LONG_WEEKDAY_MONTH_DAY_YEAR = 'PPPP',

    YEAR = 'yyyy',

    /** April 29th, 1453, Sunday */
    DATE_LONG_MONTH_DAY_YEAR_AND_WEEKDAY = 'PPP, cccc',
}

@Injectable({ providedIn: 'root' })
export class DateService {
    locale: Locale;
    constructor(@Optional() private translateService?: TranslateService) {
        this.translateService?.onLangChange
            .pipe(
                startWith({ lang: this.translateService.currentLang }),
                distinctUntilChanged((a, b) => a.lang === b.lang),
                filter((v) => !!v)
            )
            .subscribe((ev) => {
                switch (ev.lang) {
                    case 'de':
                    case 'de-ch':
                        this.locale = de;
                        break;
                    case 'fr':
                    case 'fr-ch':
                        this.locale = frCH;
                        break;
                    case 'en':
                    case 'en-us':
                        this.locale = enUS;
                        break;
                }
                // TODO: How do we load date locales (staticly?)
            });
    }

    parseOrDefault = (text: DateInput, defaultDate: Date) => {
        return this.parse(text) ?? defaultDate;
    };

    parse(text: DateInput, referenceDate?: Date) {
        if (typeof text === 'string') {
            for (const format of dateParseFormats) {
                const result = parse(text, format, referenceDate === undefined ? new Date() : referenceDate, {
                    locale: this.locale,
                });
                if (isValid(result)) {
                    return result;
                }
            }

            if (text.length > 5) {
                const iso = parseISO(text);
                if (isValid(iso)) {
                    return iso;
                }
            }
        }

        if (text instanceof Date) {
            return text;
        }

        return null;
    }

    getDateWithAddition(date: Date, duration: Duration) {
        return add(date, duration);
    }

    getDateWithReplaced(date: Date, duration: Duration) {
        return set(date, duration);
    }

    getDateAtMidnite(date: Date) {
        return set(date, { hours: 0, milliseconds: 0, minutes: 0, seconds: 0 });
    }

    getMonthsFormat(): FormattedDate[] {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const month = set(startOfYear(new Date()), { month: i });
            months[i] = {
                number: this.format(month, DateFormat.MONTH_NUMBER),
                short: this.format(month, DateFormat.MONTH_3DIGIT),
                long: this.format(month, DateFormat.MONTH_LONG),
            };
        }
        return months;
    }

    format(date: DateInput, dateFormat: DateFormat) {
        date = this.parse(date);
        if (date) {
            return format(date, dateFormat.toString(), { locale: this.locale });
        } else {
            return null;
        }
    }

    getWeekdaysFormat(): FormattedDate[] {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const localeOptions = { locale: this.locale };
            const item = setDay(startOfWeek(new Date(), localeOptions), i, localeOptions);

            const number = this.format(item, DateFormat.WEEKDAY_NUMBER);
            days[+number - 1] = {
                number,
                short: this.format(item, DateFormat.WEEKDAY_2DIGIT),
                long: this.format(item, DateFormat.WEEKDAY_LONG),
            };
        }
        return days;
    }

    setDayOfWeek(date: Date, day: number) {
        return setDay(date, day, { locale: this.locale });
    }

    getDaysInMonth(date: Date): number;
    getDaysInMonth(year: number, month: number): number;
    getDaysInMonth(dateOrYear: Date | number, month?: number) {
        const date = typeof dateOrYear === 'number' ? new Date(dateOrYear, month) : dateOrYear;

        return getDaysInMonth(date);
    }

    getDayOfWeek(date: Date) {
        return +this.format(date, DateFormat.WEEKDAY_NUMBER);
    }
}

export interface FormattedDate {
    number: string;
    short: string;
    long: string;
}
