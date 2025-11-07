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
import { TranslateModule } from '@ngx-translate/core';
import { CalendarPeriodItem, CalendarPeriodRow } from '../../services/calendar-period.service';
import { PuiCalendarYearViewService } from '../../services/calendar-year-view.service';
import { PuiCalendarGridLayoutComponent } from '../presentation/calendar-grid-layout.component';
import { PuiCalendarItemComponent } from '../presentation/calendar-item.component';

import { PuiCalendarToolbarItemDirective } from '../presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'pui-calendar-year-view',
    templateUrl: './calendar-year-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        PuiCalendarItemComponent,
        PuiCalendarGridLayoutComponent,
        PuiCalendarToolbarItemDirective,
        TranslateModule,
        A11yModule,
    ],
})
export class PuiCalendarYearViewComponent {
    private _viewService = inject(PuiCalendarYearViewService);

    @HostBinding('class')
    readonly className = 'flex flex-auto flex-col';

    readonly viewDateSignal = signal<Date | null>(null);
    readonly selectedDateSignal = signal<Date | null>(null);
    readonly focusedDateSignal = signal<Date | null>(null);

    readonly dateRowsSignal = computed(() => this._getYearsForDecade(this.viewDateSignal()));

    readonly selectedItemSignal = computed(() => this._findItemByDate(this.selectedDateSignal()));
    readonly focusedItemSignal = computed(() => this._findItemByDate(this.focusedDateSignal()));

    readonly todayItemSignal = computed(() => this._findItemByDate(new Date()));

    readonly periodLabelSignal = computed(() => {
        const view = this.viewDateSignal();
        return view ? this._viewService.getYearRangeLabel(view.getFullYear()) : '';
    });

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
    itemDisabledHandler?: (item: CalendarPeriodItem) => boolean;

    @Output()
    readonly clickItem = new EventEmitter<CalendarPeriodItem>();

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

    private _getYearsForDecade(referenceDate: Date | null): CalendarPeriodRow[] {
        if (!referenceDate) return [];
        const period = { year: referenceDate.getFullYear() };
        const rows: CalendarPeriodRow[] = [];

        const startDecade = this._viewService.getStartDecade(period.year);

        for (let row = 0; row < this._viewService.yearsPerColumn; row++) {
            rows[row] = { items: [] };
            for (let column = 0; column < this._viewService.yearsPerRow; column++) {
                const newDate = new Date(startDecade + row * this._viewService.yearsPerRow + column, 0, 1);
                const year = newDate.getFullYear();
                rows[row].items[column] = {
                    date: newDate,
                    label: `${year}`,
                    labelShort: `${year}`,
                    year: year,
                    month: 0,
                    day: 1,
                    isOtherPeriod: false,
                };
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
                if (item.year === date.getFullYear()) {
                    return item;
                }
            }
        }

        return null;
    }
}

