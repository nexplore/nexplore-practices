import { A11yModule } from '@angular/cdk/a11y';

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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateFormat, DateService } from '../../../date.service';
import { PuiIconArrowComponent } from '../../../icons/icon-arrow.component';
import { CalendarPeriodItem, CalendarPeriodRow } from '../../services/calendar-period.service';
import { PuiCalendarGridLayoutComponent } from '../presentation/calendar-grid-layout.component';
import { PuiCalendarItemComponent } from '../presentation/calendar-item.component';

import { PuiCalendarToolbarItemDirective } from '../presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'pui-calendar-month-view',
    templateUrl: './calendar-month-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        PuiCalendarItemComponent,
        PuiCalendarGridLayoutComponent,
        PuiCalendarToolbarItemDirective,
        PuiIconArrowComponent,
        TranslateModule,
        A11yModule,
    ],
})
export class PuiCalendarMonthViewComponent {
    private _dateService = inject(DateService);
    private _translateService = inject(TranslateService);

    @HostBinding('class')
    readonly className = 'flex flex-auto flex-col';

    readonly rowLabelsHeader = {
        long: this._translateService.instant('Practices.Labels_DatePicker_Calendarweek'),
        short: this._translateService.instant('Practices.Labels_DatePicker_CalendarweekShort'),
    };

    readonly headers = this._dateService.getWeekdaysFormat();

    readonly viewDateSignal = signal<Date | null>(null);
    readonly selectedDateSignal = signal<Date | null>(null);
    readonly focusedDateSignal = signal<Date | null>(null);

    readonly dateRowsSignal = computed(() => this._getMonthsForYear(this.viewDateSignal()));

    readonly selectedItemSignal = computed(() => this._findItemByDate(this.selectedDateSignal()));
    readonly focusedItemSignal = computed(() => this._findItemByDate(this.focusedDateSignal()));

    readonly todayItemSignal = computed(() => this._findItemByDate(new Date()));

    readonly periodLabelSignal = computed(() => this._dateService.format(this.viewDateSignal(), DateFormat.YEAR));

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
    disabled = false;

    @Input()
    canClickPeriodHeader = false;

    @Input()
    itemDisabledHandler?: (item: CalendarPeriodItem) => boolean;

    @Output()
    readonly clickItem = new EventEmitter<CalendarPeriodItem>();

    @Output()
    readonly clickPeriodHeader = new EventEmitter<void>();

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

    private _getMonthsForYear(referenceDate: Date | null): CalendarPeriodRow[] {
        if (!referenceDate) {
            return [];
        }

        const period = { year: referenceDate.getFullYear() };
        const rows: CalendarPeriodRow[] = [];

        let month = 0;
        for (let i = 0; i < 4; i++) {
            const items: CalendarPeriodItem[] = [];
            rows[i] = { items };
            for (let j = 0; j < 3; j++) {
                const newDate = new Date(period.year, month, 1);
                items[j] = {
                    date: newDate,
                    day: 1,
                    month: month,
                    year: period.year,
                    labelShort: this._dateService.format(newDate, DateFormat.MONTH_LONG),
                    label: this._dateService.format(newDate, DateFormat.MONTH_LONG) + ' ' + newDate.getFullYear(),
                    isOtherPeriod: false,
                };
                month++;
            }
        }

        return rows;
    }

    private _findItemByDate(date: Date | null) {
        if (!date) {
            return null;
        }

        for (const row of this.dateRowsSignal()) {
            for (const item of row.items) {
                if (item.year === date.getFullYear() && item.month === date.getMonth()) {
                    return item;
                }
            }
        }

        return null;
    }
}

