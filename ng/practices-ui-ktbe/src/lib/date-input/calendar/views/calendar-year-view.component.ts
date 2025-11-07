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
import { PuibeCalendarItemComponent } from '../presentation/calendar-item.component';

import { PuibeCalendarYearViewService } from '../../services/calendar-year-view.service';
import { PuibeCalendarGridLayoutComponent } from '../presentation/calendar-grid-layout.component';
import { PuibeCalendarToolbarItemDirective } from '../presentation/calendar-toolbar-item.directive';

@Component({
    selector: 'puibe-calendar-year-view',
    templateUrl: './calendar-year-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        PuibeCalendarItemComponent,
        PuibeCalendarGridLayoutComponent,
        PuibeCalendarToolbarItemDirective,
        TranslateModule,
        A11yModule,
    ],
})
export class PuibeCalendarYearViewComponent {
    private _viewService = inject(PuibeCalendarYearViewService);

    @HostBinding('class')
    readonly className = 'flex flex-auto flex-col';

    readonly viewDateSignal = signal<Date>(null);
    readonly selectedDateSignal = signal<Date>(null);
    readonly focusedDateSignal = signal<Date>(null);

    readonly dateRowsSignal = computed(() => this._getYearsForDecade(this.viewDateSignal()));

    readonly selectedItemSignal = computed(() => this._findItemByDate(this.selectedDateSignal()));
    readonly focusedItemSignal = computed(() => this._findItemByDate(this.focusedDateSignal()));

    readonly todayItemSignal = computed(() => this._findItemByDate(new Date()));

    readonly periodLabelSignal = computed(() =>
        this._viewService.getYearRangeLabel(this.viewDateSignal().getFullYear()),
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
    itemDisabledHandler: (item: CalendarPeriodItem) => boolean;

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

    private _getYearsForDecade(referenceDate: Date): CalendarPeriodRow[] {
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

    private _findItemByDate(date: Date) {
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

