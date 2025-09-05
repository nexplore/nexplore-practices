import { A11yModule } from '@angular/cdk/a11y';
import { NgIf, NgFor, NgClass } from '@angular/common';
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
import { PuibeCalendarItemComponent } from '../presentation/calendar-item.component';
import { CalendarPeriodItem, CalendarPeriodRow } from '../../services/calendar-period.service';
import { DateFormat, DateService } from '../../../date.service';
import { PuibeCalendarRowLabelComponent } from '../presentation/calendar-row-label.component';
import { PuibeCalendarToolbarItemDirective } from '../presentation/calendar-toolbar-item.directive';
import { PuibeIconArrowComponent } from '../../../icons/icon-arrow.component';
import { PuibeCalendarGridLayoutComponent } from '../presentation/calendar-grid-layout.component';

@Component({
    selector: 'puibe-calendar-month-view',
    templateUrl: './calendar-month-view.component.html',
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
export class PuibeCalendarMonthViewComponent {
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
    disabled: boolean;

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

    private _getMonthsForYear(referenceDate: Date): CalendarPeriodRow[] {
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

    private _findItemByDate(date: Date) {
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
