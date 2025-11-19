import { A11yModule } from '@angular/cdk/a11y';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    computed,
    inject,
    signal,
} from '@angular/core';
import { getSignalsFirstValue } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getWeek } from 'date-fns';
import { DateFormat, DateService } from '../../../date.service';
import { PuibeIconArrowComponent } from '../../../icons/icon-arrow.component';
import { splitArrayChunks } from '../../../util/utils';
import { CalendarPeriodItem, CalendarPeriodRow } from '../../services/calendar-period.service';
import { PuibeCalendarGridLayoutComponent } from '../presentation/calendar-grid-layout.component';
import { PuibeCalendarItemComponent } from '../presentation/calendar-item.component';
import { PuibeCalendarRowLabelComponent } from '../presentation/calendar-row-label.component';
import { PuibeCalendarToolbarItemDirective } from '../presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'puibe-calendar-date-view',
    templateUrl: './calendar-date-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        PuibeCalendarItemComponent,
        PuibeCalendarRowLabelComponent,
        PuibeCalendarGridLayoutComponent,
        PuibeCalendarToolbarItemDirective,
        PuibeIconArrowComponent,
        NgIf,
        NgFor,
        NgClass,
        TranslateModule,
        A11yModule,
    ],
})
export class PuibeCalendarDateViewComponent {
    private _dateService = inject(DateService);
    private _translateService = inject(TranslateService);

    @HostBinding('class')
    readonly className = 'flex flex-auto flex-col';

    readonly rowLabelsHeader = {
        long: this._translateService.instant('Practices.Labels_DatePicker_Calendarweek'),
        short: this._translateService.instant('Practices.Labels_DatePicker_CalendarweekShort'),
    };

    readonly headers = this._dateService.getWeekdaysFormat();

    readonly viewDateSignal = signal<Date>(null);
    readonly selectedDateSignal = signal<Date>(null);
    readonly focusedDateSignal = signal<Date>(null);

    readonly dateRowsSignal = computed(() => this._getDatesForMonth(this.viewDateSignal()));

    readonly selectedItemSignal = computed(() => this._findItemByDate(this.selectedDateSignal()));
    readonly focusedItemSignal = computed(() => {
        const focusedDate = getSignalsFirstValue(this.focusedDateSignal(), this.selectedDateSignal(), new Date());
        return this._findItemByDate(focusedDate);
    });

    readonly todayItemSignal = computed(() => this._findItemByDate(new Date()));

    readonly periodLabelSignal = computed(() =>
        this._dateService.format(this.viewDateSignal(), DateFormat.MONTH_LONG_AND_YEAR)
    );

    @Input()
    set view(value: Date) {
        this.viewDateSignal.set(value);
    }

    @Input()
    set selected(value: Date) {
        this.selectedDateSignal.set(value);
    }

    @Input()
    set focused(value: Date) {
        this.focusedDateSignal.set(value);
    }

    @Input()
    disabled: boolean;

    @Input()
    hideWeekLabels: boolean;

    @Input()
    canClickPeriodHeader: boolean;

    @Input()
    itemDisabledHandler: (item: CalendarPeriodItem) => boolean;

    @Output()
    readonly clickItem = new EventEmitter<CalendarPeriodItem>();

    @Output()
    readonly clickPeriodHeader = new EventEmitter<void>();

    trackByIndex = (i: number) => i;
    trackByShortLabel = (_: number, item: CalendarPeriodItem) => item.labelShort;

    isItemDisabled(item: CalendarPeriodItem) {
        if (this.disabled) {
            return true;
        }

        if (this.itemDisabledHandler) {
            return this.itemDisabledHandler(item);
        }

        return false;
    }

    private _getDatesForMonth(referenceDate: Date): CalendarPeriodRow[] {
        if (!referenceDate) {
            return [];
        }

        const period = { year: referenceDate.getFullYear(), month: referenceDate.getMonth() };
        const daysInMonth = this._dateService.getDaysInMonth(period.year, period.month);

        const daysArray: CalendarPeriodItem[] = [];

        // find where to start calendar day of week
        const firstDateOfMonth = new Date(period.year, period.month);
        let dayOfWeek = this._dateService.getDayOfWeek(firstDateOfMonth) - 1;
        for (let i = dayOfWeek; i >= 1; i--) {
            const newDate = this._dateService.getDateWithAddition(firstDateOfMonth, { days: -i });
            daysArray.push({
                day: newDate.getDate(),
                month: newDate.getMonth(),
                year: newDate.getFullYear(),
                labelShort: newDate.getDate().toString(),
                label: this._dateService.format(newDate, DateFormat.DATE_LONG_MONTH_DAY_YEAR),
                isOtherPeriod: true,
                date: newDate,
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(period.year, period.month, i);
            daysArray.push({
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                labelShort: date.getDate().toString(),
                label: this._dateService.format(date, DateFormat.DATE_LONG_MONTH_DAY_YEAR),
                isOtherPeriod: false,
                date,
            });
        }

        const lastDateOfMonth = this._dateService.getDateWithAddition(firstDateOfMonth, { days: -1, months: 1 });
        dayOfWeek = this._dateService.getDayOfWeek(lastDateOfMonth) - 1;
        let daysLeft = 6 - dayOfWeek;
        // 35 is the exact amount of days in 5 weeks. The datepicker month has a capacity of 6 weeks, so if we just have 5 weeks, we add another week to fill the available space.
        daysLeft = daysArray.length <= 35 ? daysLeft + 7 : daysLeft;
        for (let i = 1; i <= daysLeft; i++) {
            const newDate = this._dateService.getDateWithAddition(lastDateOfMonth, { days: i });
            daysArray.push({
                day: newDate.getDate(),
                month: newDate.getMonth(),
                year: newDate.getFullYear(),
                labelShort: newDate.getDate().toString(),
                label: this._dateService.format(newDate, DateFormat.DATE_LONG_MONTH_DAY_YEAR),
                isOtherPeriod: true,
                date: newDate,
            });
        }

        const rows = splitArrayChunks(daysArray, 7).map((weekdays) => {
            const calendarWeek = getWeek(weekdays[0].date)?.toString();
            return {
                rowLabel: calendarWeek,
                rowLabelLong:
                    this._translateService.instant('Practices.Labels_DatePicker_Calendarweek') + ` ${calendarWeek}`,
                items: weekdays,
            };
        });

        return rows;
    }

    private _findItemByDate(date: Date) {
        if (!date) {
            return null;
        }

        for (const row of this.dateRowsSignal()) {
            for (const item of row.items) {
                if (item.year === date.getFullYear() && item.month === date.getMonth() && item.day === date.getDate()) {
                    return item;
                }
            }
        }

        return null;
    }
}
