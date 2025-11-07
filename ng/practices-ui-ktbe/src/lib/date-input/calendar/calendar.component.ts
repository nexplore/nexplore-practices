import { A11yModule } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    inject,
    Input,
    OnInit,
    Output,
    signal,
    TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DestroyService, getSignalsFirstValue } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { min } from 'date-fns/min';
import { max } from 'date-fns/max';
import { PuibeIconArrowComponent } from '../../icons/icon-arrow.component';

import { PuibeIconDatepickerTodayComponent } from '../../icons/icon-datepicker-today.component';
import { setHostAttr } from '../../util/utils';
import { PuibeCalendarKeyboardNavigationService } from '../services/calendar-keyboard-navigation.service';
import {
    CalendarPeriod,
    CalendarPeriodItem,
    CalendarPeriodType,
    DateInput,
    PuibeCalendarPeriodService,
} from '../services/calendar-period.service';
import { PuibeCalendarToolbarItemDirective } from './presentation/calendar-toolbar-item.directive';
import { PuibeCalendarDateViewComponent } from './views/calendar-date-view.component';
import { PuibeCalendarMonthViewComponent } from './views/calendar-month-view.component';
import { PuibeCalendarYearViewComponent } from './views/calendar-year-view.component';

let nextUniqueId = 0;

export type CalendarViewMode = CalendarPeriodType;
export type AllowedViewModesArray = ['date', 'month', 'year'] | ['month', 'year'] | ['year'];
const defaultViewModes: AllowedViewModesArray = ['date', 'month', 'year'];
@Component({
    selector: 'puibe-calendar',
    templateUrl: './calendar.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    PuibeCalendarDateViewComponent,
    PuibeCalendarMonthViewComponent,
    PuibeCalendarYearViewComponent,
    PuibeCalendarToolbarItemDirective,
    NgTemplateOutlet,
    TranslateModule,
    PuibeIconArrowComponent,
    PuibeIconDatepickerTodayComponent,
    A11yModule
],
    providers: [
        DestroyService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PuibeCalendarComponent),
            multi: true,
        },
    ],
})
export class PuibeCalendarComponent implements OnInit, ControlValueAccessor {
    @HostListener('keydown', ['$event'])
    onFocusedKeydown(ev: KeyboardEvent) {
        if (this.disabled) {
            return;
        }

        this._handleKeydown(ev);
    }

    @HostListener('focusout', ['$event'])
    onFocusout(ev: FocusEvent) {
        if (!ev.relatedTarget && this.focusedDateSignal() && this.isEventTargetOnCalendarOrCurrentDate(ev.target)) {
            ev.preventDefault();

            // This is a accessibility workaround, so that the screen reader does not read the whole description again when navigating between months.
            this._elementRef.nativeElement.querySelector<HTMLElement>('[data-current-month]').focus();
        }
    }

    @HostListener('focus', ['$event'])
    onFocusin(ev: FocusEvent) {
        const newInitialDate = this.selectedDateSignal() ?? this.focusedDateSignal();
        if (newInitialDate && !this.isEventTargetOnCalendarOrAnySubchild(ev.relatedTarget)) {
            this._initialDateSignal.set(newInitialDate);
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(ev: FocusEvent) {
        if (!this.isEventTargetOnCalendarOrAnySubchild(ev.relatedTarget) && this.blurHandler) {
            this.blurHandler();
        }
    }

    private _calendarKeyboardNavigation = inject(PuibeCalendarKeyboardNavigationService);
    private _datePeriodService = inject(PuibeCalendarPeriodService);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _translate = inject(TranslateService);

    /** Handler used by NG_VALUE_ACCESSOR */
    private _changeHandler: (v: any) => void;
    /** Handler used by NG_VALUE_ACCESSOR */
    private _touchedHandler: () => void;

    private readonly _initialDateSignal = signal<Date>(null);
    private readonly _minDateSignal = signal<Date>(null);
    private readonly _maxDateSignal = signal<Date>(null);
    private readonly _selectionModeSignal = signal<CalendarPeriodType>('date');
    private readonly _requestedViewModeSignal = signal<CalendarViewMode>(null);
    private readonly _requestedPeriodSignal = signal<CalendarPeriod>(null);
    private readonly _periodSignal = computed(() => {
        // We have to read all dependent signals before using them in any if-branches, so that the tracking works properly!
        const requestedPeriod = this._requestedPeriodSignal();
        const fallbackDate = this._restrictDateToMinMax(
            getSignalsFirstValue(
                this.focusedDateSignal(),
                this.selectedDateSignal(),
                this._initialDateSignal(),
                new Date()
            )
        );

        if (requestedPeriod) {
            return requestedPeriod;
        } else {
            return {
                year: fallbackDate.getFullYear(),
                month: fallbackDate.getMonth(),
            };
        }
    });

    private readonly _prevPeriodSignal = computed(() =>
        this._datePeriodService.movePrevPeriod(this.activeViewModeSignal(), {
            year: this._yearSignal(),
            month: this._monthSignal(),
        })
    );

    private readonly _nextPeriodSignal = computed(() =>
        this._datePeriodService.moveNextPeriod(this.activeViewModeSignal(), {
            year: this._yearSignal(),
            month: this._monthSignal(),
        })
    );

    private readonly _monthSignal = computed(() => this._periodSignal()?.month);
    private readonly _yearSignal = computed(() => this._periodSignal()?.year);

    readonly idSignal = signal(this._elementRef.nativeElement.id || 'date-picker');
    readonly idEffect = effect(() => this._setIdAttr(this.idSignal())); // Syncs the id attribute

    readonly focusedDateSignal = signal<Date>(null);
    readonly selectedDateSignal = signal<Date>(undefined);
    readonly selectedDateEffect = effect(() => {
        const date = this.selectedDateSignal();
        if (date === undefined) {
            return;
        }

        this.selectedDateChange.emit(date);

        if (this._changeHandler) {
            this._changeHandler(date);
        }
    });

    readonly activeViewModeSignal = computed(() =>
        getSignalsFirstValue(this._requestedViewModeSignal(), this._selectionModeSignal(), this.allowedViewModes[0])
    );

    readonly ariaInitialDateLabelSignal = computed(() =>
        this._datePeriodService.formatLong(this.activeViewModeSignal(), this._initialDateSignal())
    );

    readonly dateForCurrentPeriodViewSignal = computed(() => new Date(this._yearSignal(), this._monthSignal(), 1));

    readonly canMovePrevPeriodSignal = computed(() => {
        const period = this._prevPeriodSignal();

        const prevPeriodDate = new Date(period.year, period.month, 31);
        if (this.min && prevPeriodDate < this.min) {
            return false;
        }

        return true;
    });

    readonly canMoveNextPeriodSignal = computed(() => {
        const period = this._nextPeriodSignal();

        const nextPeriodDate = new Date(period.year, period.month, 1);
        if (this.max && nextPeriodDate > this.max) {
            return false;
        }

        return true;
    });

    readonly isTodayWithinMinMaxSignal = computed(() => {
        const [min, max] = [this._minDateSignal(), this._maxDateSignal()];
        const today = this._getToday();
        if (min && today < min) {
            return false;
        }

        if (max && today > max) {
            return false;
        }

        return true;
    });

    readonly ariaNotificationOutputSignal = signal<string>('');

    /** The help description is for screen reader users, explaing keyboard shortcuts. Changes based on the selection mode.  */
    readonly helpDescriptionSignal = computed(() => {
        switch (this._selectionModeSignal()) {
            case 'month':
                return this._translate.instant('Practices.Labels_DatePicker_HelpDescription_Month');
            case 'year':
                return this._translate.instant('Practices.Labels_DatePicker_HelpDescription_Year');
            case 'date':
            default:
                return this._translate.instant('Practices.Labels_DatePicker_HelpDescription');
        }
    });

    readonly noSelectedDateLabelSignal = computed(() => {
        switch (this._selectionModeSignal()) {
            case 'month':
                return this._translate.instant('Practices.Labels_DatePicker_NoSelectedDate_Month');
            case 'year':
                return this._translate.instant('Practices.Labels_DatePicker_NoSelectedDate_Year');
            case 'date':
            default:
                return this._translate.instant('Practices.Labels_DatePicker_NoSelectedDate');
        }
    });

    readonly focusedDateLabelSignal = computed(
        () =>
            this._translate.instant('Practices.Labels_DatePicker_SelectedDate') +
            ': ' +
            this._datePeriodService.formatLong(this.activeViewModeSignal(), this.focusedDateSignal())
    );

    readonly labeledByIdSignal = computed(() => this._getLabeledBy(this.idSignal()));
    readonly describedByIdSignal = computed(() => this._getDescribedBy(this.idSignal()));
    readonly valueLabelIdSignal = computed(() => this._getValueLabelBy(this.idSignal()));

    @HostBinding('class')
    readonly className = 'h-80 w-80 overflow-hidden max-sm:w-screen max-sm:h-96 relative block';

    // Note: Role 'application' allows the keyboard shortcuts to work consistently. Role 'dialog' does not allow this.
    @HostBinding('attr.role')
    readonly ariaRole = 'application';

    /**
     * The initial date is used to determine which date to initially focus when the calendar is opened.
     */
    @Input()
    set initialDate(value: DateInput) {
        this._initialDateSignal.set(
            this._datePeriodService.parse(this.activeViewModeSignal(), value, {
                strict: false,
            })
        );
    }

    /** Change view mode between date, month, or year view */
    @Input()
    set viewMode(value: CalendarViewMode) {
        this._requestedViewModeSignal.set(value);
    }

    @Input()
    hideTodayButton: boolean;

    /**
     * Customize which view modes the user may have access to.
     */
    @Input()
    allowedViewModes: AllowedViewModesArray = defaultViewModes;

    @Input()
    hideWeekLabels: boolean;

    @HostBinding('class.opacity-70')
    @HostBinding('class.pointer-events-none')
    @HostBinding('attr.aria-disabled')
    @Input()
    disabled: boolean;

    @Input()
    blurHandler: () => void;

    @Input()
    toolbarAdditionalItemsTemplate: TemplateRef<unknown>;

    @Input()
    set id(val: string) {
        this.idSignal.set(val);
    }

    get id() {
        return this._elementRef.nativeElement.id;
    }

    @Input()
    set selectedDate(val: DateInput) {
        if (this.selectedDate !== val) {
            const parsed = this._datePeriodService.parse(this.selectionMode, val, { strict: false });
            this.selectedDateSignal.set(parsed);
        }
    }

    get selectedDate(): Date {
        return this.selectedDateSignal();
    }

    /**
     * The mode of selection, also changes the view mode
     */
    @Input()
    set selectionMode(value: CalendarPeriodType) {
        this._selectionModeSignal.set(value ?? 'date');
    }

    get selectionMode() {
        return this._selectionModeSignal();
    }

    @Input()
    set min(value: DateInput) {
        const parsed = this._datePeriodService.parse(this.selectionMode, value, { strict: false });
        this._minDateSignal.set(parsed);
    }

    get min(): Date | null {
        return this._minDateSignal();
    }

    @Input()
    set max(value: DateInput) {
        const parsed = this._datePeriodService.parse(this.selectionMode, value, { strict: false });
        this._maxDateSignal.set(parsed);
    }

    get max(): Date | null {
        return this._maxDateSignal();
    }

    @Input()
    ariaAdditionalDescription: string;

    /**
     * Emits all changes of the selected date
     */
    @Output()
    selectedDateChange = new EventEmitter<Date>();

    /**
     * Emits the date that the user clicked on
     */
    @Output()
    clickDate = new EventEmitter<Date>();

    /**
     * Emits the selected date when the user navigates using the keyboard (ARROW keys or other shortcuts)
     */
    @Output()
    keyboardNavigateDate = new EventEmitter<Date>();

    /**
     * Emits the selected date when ENTER, SPACE or TAB is pressed while datepicker is focused.
     * If ESCAPE is pressed, emits `null`
     */
    @Output()
    keyboardSubmit = new EventEmitter<Date>();

    ngOnInit(): void {
        if (!this.allowedViewModes) {
            this.allowedViewModes = defaultViewModes;
        }

        if (!this._elementRef.nativeElement.hasAttribute('tabIndex')) {
            // Set default tabindex, to make sure it is focusable
            this._elementRef.nativeElement.tabIndex = 0;
        }

        if (!this.id) {
            // Set default value for id
            this._setIdAttr('puibe-calendar-' + nextUniqueId++);
        }
    }

    // NG_VALUE_ACCESSOR START
    writeValue(obj: any): void {
        this.selectedDate = obj;
    }
    registerOnChange(fn: any): void {
        this._changeHandler = fn;
    }
    registerOnTouched(fn: any): void {
        this._touchedHandler = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    // NG_VALUE_ACCESSOR END

    focus() {
        this._elementRef.nativeElement.focus();
    }

    getNativeElement() {
        return this._elementRef.nativeElement;
    }

    moveToday() {
        const today = this._getToday();
        if (!this._canMoveToDate(today)) {
            return;
        }

        const newPeriod: CalendarPeriod = { year: today.getFullYear(), month: today.getMonth() };
        if (!this._datePeriodService.arePeriodsEqual(this.activeViewModeSignal(), newPeriod, this._periodSignal())) {
            this._requestedPeriodSignal.set(newPeriod);
        } else {
            this.tryChangePeriodView(this.allowedViewModes[0]);
        }

        this.focusedDateSignal.set(today);
        this._triggerFocusForCurrentDate();
    }

    private _getToday() {
        return this._datePeriodService.convertDateToFitPeriodType(this.selectionMode, new Date());
    }

    moveNextPeriod() {
        if (!this.canMoveNextPeriodSignal()) {
            return;
        }

        const nextPeriod = this._nextPeriodSignal();
        this._requestedPeriodSignal.set(nextPeriod);
        this.focusedDateSignal.set(null);
    }

    movePrevPeriod() {
        if (!this.canMovePrevPeriodSignal()) {
            return;
        }

        const prevPeriod = this._prevPeriodSignal();
        this._requestedPeriodSignal.set(prevPeriod);

        this.focusedDateSignal.set(null);
    }

    onItemClick(item: CalendarPeriodItem) {
        if (!this._canMoveToDate(item.date)) {
            return;
        }

        if (this._touchedHandler) {
            this._touchedHandler();
        }

        this._requestedPeriodSignal.set(null);
        if (this.activeViewModeSignal() === this.selectionMode) {
            this._setDateValue(item.date);
            setTimeout(() => {
                // Timeout so any signal based effects can run before this event is triggered
                this.clickDate.emit(this.selectedDateSignal());
            });
        } else {
            this._drillDownPeriodView(item.date);
        }
    }

    canChangePeriodView(nextView: CalendarViewMode) {
        const currentIndex = this.allowedViewModes.indexOf(nextView as any);
        if (currentIndex !== -1) {
            return true;
        } else {
            return false;
        }
    }

    isEventTargetOnCalendarOrCurrentDate(eventTarget: EventTarget) {
        return (
            eventTarget === this._elementRef.nativeElement ||
            (eventTarget as HTMLElement).matches('[data-focused-date]')
        );
    }

    isEventTargetOnCalendarOrAnySubchild(eventTarget: EventTarget) {
        return (
            eventTarget === this._elementRef.nativeElement ||
            this._elementRef.nativeElement.contains(eventTarget as HTMLElement)
        );
    }

    itemDisabledHandler = (item: CalendarPeriodItem) => {
        return false === this._canMoveToDate(item.date);
    };

    tryChangePeriodView(nextView: CalendarViewMode) {
        if (nextView !== this.activeViewModeSignal() && this.canChangePeriodView(nextView)) {
            this._requestedViewModeSignal.set(nextView);
            const firstItemOfCurrentPeriod = this._datePeriodService.convertDateToFitPeriodType(
                nextView,
                new Date(this._yearSignal(), this._monthSignal())
            );
            this.focusedDateSignal.set(firstItemOfCurrentPeriod);
            this._triggerFocusForCurrentDate();
        }
    }

    private _drillDownPeriodView(date: Date) {
        let nextView: CalendarPeriodType;
        const currentIndex = this.allowedViewModes.indexOf(this.activeViewModeSignal() as any);
        if (currentIndex === 0) {
            nextView = this.activeViewModeSignal();
        } else if (currentIndex !== -1) {
            nextView = this.allowedViewModes[currentIndex - 1];
        } else {
            nextView = this.activeViewModeSignal();
        }

        if (nextView !== this.activeViewModeSignal() && this.canChangePeriodView(nextView)) {
            this._requestedViewModeSignal.set(nextView);
            const firstItemOfCurrentPeriod = this._datePeriodService.getFirstItemOfPeriod(this.activeViewModeSignal(), {
                year: date.getFullYear(),
                month: date.getMonth(),
            });
            this.focusedDateSignal.set(firstItemOfCurrentPeriod);
            this._triggerFocusForCurrentDate();
        }
    }

    private _canMoveToDate(date: Date) {
        if (!date) {
            return false;
        }

        if (
            this.min &&
            this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), date) <
                this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), this.min)
        ) {
            return false;
        }

        if (
            this.max &&
            this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), date) >
                this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), this.max)
        ) {
            return false;
        }

        return true;
    }

    private _setDateValue(date: Date) {
        this.selectedDateSignal.set(date);
    }

    private _handleKeydown(event: KeyboardEvent) {
        if (event.code === 'Enter' && this.isEventTargetOnCalendarOrCurrentDate(event.target)) {
            if (this.activeViewModeSignal() === this.selectionMode) {
                this._setDateValue(this.focusedDateSignal());

                this._initialDateSignal.set(this.selectedDate);
                this.keyboardSubmit.emit(this.selectedDate);
            } else {
                this._drillDownPeriodView(this.focusedDateSignal());
            }

            event.preventDefault();
        } else if (event.code === 'Escape' && this.isEventTargetOnCalendarOrAnySubchild(event.target)) {
            this.keyboardSubmit.emit(null);
        }

        const allowedKeysStartWith = ['Arrow', 'Page', 'Home', 'End'];
        if (allowedKeysStartWith.findIndex((key) => event.code.includes(key)) >= 0) {
            let newDate: Date;
            if (
                event.code.startsWith('Arrow') &&
                !document.activeElement?.matches('[data-focused-date]') &&
                !this.selectedDateSignal() &&
                !this.focusedDateSignal()
            ) {
                // There was no focus/selection, so we should focus the initial date
                const startDate = this._getInitialStartDate();
                const isStartDateInsideCurrentPage = this._datePeriodService.dateMatchesPeriod(
                    this.activeViewModeSignal(),
                    startDate,
                    this._periodSignal()
                );

                newDate = isStartDateInsideCurrentPage ? startDate : this._getFirstDateOfCurrentPeriodPage();
            } else {
                const startDate = this._getInitialStartDate();

                // handle event and get new date
                newDate = this._calendarKeyboardNavigation.navigateDateByKeyboard(
                    this.activeViewModeSignal(),
                    startDate,
                    event
                );
            }

            if (this._canMoveToDate(newDate)) {
                this.focusedDateSignal.set(newDate);
                this.ariaNotificationOutputSignal.set('');
                this._requestedPeriodSignal.set(null);
                this.keyboardNavigateDate.emit(newDate);
                this._triggerFocusForCurrentDate();
                event.stopPropagation();
                event.preventDefault();
            } else if (newDate) {
                // Notify the (Screenreader)-user that the date could not be navigated to.
                this._notifyScreenreaderOfFailedDateNavigation(newDate);
            }
        }
    }

    private _getInitialStartDate() {
        const startDate = this._datePeriodService.convertDateToFitPeriodType(
            this.activeViewModeSignal(),
            this._restrictDateToMinMax(
                this.focusedDateSignal() ??
                    this.selectedDateSignal() ??
                    this._initialDateSignal() ??
                    this._getFirstDateOfCurrentPeriodPage() ??
                    new Date()
            )
        );

        const isStartDateInsideCurrentPage = this._datePeriodService.dateMatchesPeriod(
            this.activeViewModeSignal(),
            startDate,
            this._periodSignal()
        );

        return isStartDateInsideCurrentPage ? startDate : this._getFirstDateOfCurrentPeriodPage();
    }

    private _getFirstDateOfCurrentPeriodPage() {
        return this._datePeriodService.getFirstItemOfPeriod(this.activeViewModeSignal(), this._periodSignal());
    }

    private _notifyScreenreaderOfFailedDateNavigation(newDate: Date) {
        const prevAriaNotificationOutput = this.ariaNotificationOutputSignal();
        if (newDate > this.focusedDateSignal()) {
            this.ariaNotificationOutputSignal.set(
                this._translate.instant('Practices.Labels_DatePicker_Max') +
                    `: ${this._datePeriodService.format(this.activeViewModeSignal(), this.max)}`
            );
        } else if (newDate < this.focusedDateSignal()) {
            this.ariaNotificationOutputSignal.set(
                this._translate.instant('Practices.Labels_DatePicker_Min') +
                    `: ${this._datePeriodService.format(this.activeViewModeSignal(), this.min)}`
            );
        }

        if (
            prevAriaNotificationOutput === this.ariaNotificationOutputSignal() &&
            this.ariaNotificationOutputSignal()?.length > 1
        ) {
            // Reinforce the message on the second repetition
            this.ariaNotificationOutputSignal.update((text) => text + '! ' + this.focusedDateLabelSignal());
        }
    }
    private _triggerFocusForCurrentDate() {
        // Timeout should trigger after next render, then find element to manually focus
        setTimeout(() => {
            const selectedDateEl =
                this._elementRef.nativeElement.querySelector<HTMLElement>('[data-focused-date="true"]') ??
                this._elementRef.nativeElement.querySelector<HTMLElement>('[data-focused-date="false"]');
            if (selectedDateEl) {
                selectedDateEl.focus();
            }
        });
    }

    private _restrictDateToMinMax(date: Date): Date {
        let newDate = date;
        if (this.max) {
            newDate = min([
                newDate,
                this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), this.max),
            ]);
        }

        if (this.min) {
            newDate = max([
                newDate,
                this._datePeriodService.convertDateToFitPeriodType(this.activeViewModeSignal(), this.min),
            ]);
        }

        return newDate;
    }

    private _getLabeledBy(baseId: string) {
        return baseId + '-timeperiod';
    }

    private _getValueLabelBy(baseId: string) {
        return baseId + '-value';
    }

    private _getDescribedBy(baseId: string) {
        return baseId + '-desc';
    }

    private _setIdAttr(id: string) {
        setHostAttr('id', id, this._elementRef);
        setHostAttr('aria-labelledby', this._getLabeledBy(id), this._elementRef);
        setHostAttr('aria-describedby', this._getDescribedBy(id), this._elementRef);
    }
}
