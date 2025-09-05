import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { EMPTY, Observable, filter, switchMap, takeUntil } from 'rxjs';
import { setHostAttr } from '../util/utils';
import { AllowedViewModesArray, CalendarViewMode } from './calendar/calendar.component';
import { PuibeCalendarFlyoutRef, PuibeCalendarFlyoutService } from './services/calendar-flyout.service';
import { CalendarPeriodType, DateInput, PuibeCalendarPeriodService } from './services/calendar-period.service';

@Directive({
    selector: '[puibeCalendarPickerAnchor]',
    standalone: true,
    providers: [DestroyService],
})
/** @internal */
export class PuibeCalendarPickerAnchorDirective implements OnInit {
    @HostListener('keydown', ['$event'])
    onKeydown(ev: KeyboardEvent) {
        if (ev.code === 'Enter' || ev.code === 'Space') {
            ev.preventDefault();
            if (!this.disableCalendarKeyboardActivation) {
                this.toggleOverlayAndApplyPreviewDate({ side: 'start', initiator: 'keyboard' });
            } else if (this._flyoutRef) {
                this._applyPreviewDate();
                this.closeOverlay();
            }
        } else if (ev.code === 'Escape') {
            this.closeOverlay();
        }
    }

    @HostListener('blur', ['$event'])
    onBlur(ev: FocusEvent) {
        // If we have an open overlay, close it (unless it is the next focused target)
        if (!!this._flyoutRef && !this._flyoutRef?.calendar.isEventTargetOnCalendarOrAnySubchild(ev.relatedTarget)) {
            this.closeOverlay();
        }
    }

    private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _calendarFlyoutService = inject(PuibeCalendarFlyoutService);
    private readonly _calendarPeriodService = inject(PuibeCalendarPeriodService);
    private readonly _destroy$ = inject(DestroyService);
    private _previewDate: Date;
    private _date: Date;
    private _minDate: Date;
    private _maxDate: Date;
    private _flyoutRef: PuibeCalendarFlyoutRef;

    static readonly HOST_DIRECTIVE_FOR_INPUT = {
        directive: PuibeCalendarPickerAnchorDirective,
        inputs: [
            'type',
            'disableCalendarKeyboardActivation',
            'calendarViewMode',
            'calendarAllowedViewModes',
            'calendarHideWeekLabels',
            'calendarHideTodayButton',
            'calendarInitialDate',
            'disableCalendar',
            'min',
            'max',
        ],
    };

    /**
     * By default, The calendar popup will toggle open and closed when pressing ENTER or SPACE.
     * Set `true` to disable this behavior.
     */
    @Input()
    disableCalendarKeyboardActivation: boolean;

    @Input()
    calendarViewMode: CalendarViewMode;

    @Input()
    type: CalendarPeriodType;

    @Input()
    calendarAllowedViewModes: AllowedViewModesArray;

    @Input()
    calendarHideWeekLabels: boolean;

    @Input()
    calendarHideTodayButton: boolean;

    @Input()
    calendarInitialDate: DateInput;

    /** Set `true` to completely disable the calendar popup. */
    @Input()
    disableCalendar: boolean;

    @Input()
    set min(value: DateInput) {
        this._minDate = this._calendarPeriodService.parse(this.type, value, { strict: true });
    }

    get min(): Date | null {
        return this._minDate;
    }

    @Input()
    set max(value: DateInput) {
        this._maxDate = this._calendarPeriodService.parse(this.type, value, { strict: true });
    }

    get max(): Date | null {
        return this._maxDate;
    }

    @Output()
    readonly calendarOpenChange = new EventEmitter<boolean>();

    @Output()
    readonly calendarDateChange = new EventEmitter<Date>();

    ngOnInit() {
        setHostAttr('autocomplete', !this.disableCalendar && 'off', this._elementRef);
        setHostAttr('aria-haspopup', !this.disableCalendar && 'dialog', this._elementRef);

        const overlayOpenChange$ = this.calendarOpenChange.pipe(takeUntil(this._destroy$));

        overlayOpenChange$
            .pipe(
                switchMap((open) => {
                    const calendar = this._flyoutRef?.calendar;

                    setHostAttr('aria-controls', open && calendar?.id, this._elementRef);
                    setHostAttr('aria-haspopup', open && 'dialog', this._elementRef);
                    setHostAttr('aria-expanded', open ? 'true' : 'false', this._elementRef);
                    setHostAttr('aria-label', open && '', this._elementRef);

                    if (open) {
                        calendar.selectedDate = this.getDate();
                        calendar.id = this._elementRef.nativeElement.id + '-datepicker';

                        return new Observable(() => {
                            this._previewDate = null;
                            const subscriptions = [
                                calendar.selectedDateChange.subscribe((newDate) => {
                                    this._setNewDate(newDate);
                                }),
                                calendar.clickDate.subscribe(() => {
                                    this.closeOverlay();
                                    this._elementRef.nativeElement.focus();
                                }),
                                calendar.keyboardNavigateDate.subscribe((date) => {
                                    this._previewDate = date;
                                    setHostAttr(
                                        'aria-label',
                                        this._calendarPeriodService.format(this.type, date),
                                        this._elementRef
                                    );
                                }),
                            ];

                            return () => {
                                subscriptions.forEach((s) => s.unsubscribe());
                            };
                        });
                    } else {
                        return EMPTY;
                    }
                })
            )
            .subscribe();
    }

    isOpen() {
        return !!this._flyoutRef;
    }

    toggleOverlayAndApplyPreviewDate(options: { side: 'start' | 'end'; initiator: 'button' | 'keyboard' }) {
        if (this._flyoutRef) {
            this._applyPreviewDate();
            this.closeOverlay();
        } else {
            this.openOverlay(options);
        }
    }

    openOverlay({ side, initiator }: { side: 'start' | 'end'; initiator: 'button' | 'keyboard' }) {
        if (this._flyoutRef || this.disableCalendar) {
            return;
        }

        this._flyoutRef = this._calendarFlyoutService.openCalendarFlyout({
            side,
            anchorRef: this._elementRef,
            configureCalendar: (calendar) => {
                calendar.selectedDate = this.getDate();
                calendar.min = this.min;
                calendar.max = this.max;
                if (this.calendarAllowedViewModes) {
                    calendar.allowedViewModes = this.calendarAllowedViewModes;
                }
                if (this.calendarViewMode) {
                    calendar.viewMode = this.calendarViewMode;
                }
                if (this.type) {
                    calendar.selectionMode = this.type;
                }
                if (this.calendarHideWeekLabels !== undefined) {
                    calendar.hideWeekLabels = this.calendarHideWeekLabels;
                }
                if (this.calendarHideTodayButton !== undefined) {
                    calendar.hideTodayButton = this.calendarHideTodayButton;
                }
                if (this.calendarInitialDate !== undefined) {
                    calendar.initialDate = this.calendarInitialDate;
                }

                calendar.keyboardSubmit
                    .pipe(takeUntil(this.calendarOpenChange.pipe(filter((open) => !open))))
                    .subscribe((date) => {
                        if (date) {
                            this._setNewDate(date);
                        }

                        this.closeOverlay();

                        if (initiator === 'keyboard') {
                            setTimeout(() => {
                                this._elementRef.nativeElement.focus();
                            });
                        }
                    });
            },
            onClose: () => {
                this.calendarOpenChange.emit(false);
                this._flyoutRef = null;
            },
        });

        this.calendarOpenChange.emit(true);
    }

    closeOverlay() {
        this._flyoutRef?.close();
    }

    setDate(date: Date) {
        this._date = date;
        if (this._flyoutRef?.calendar) {
            this._flyoutRef.calendar.selectedDate = date;
        }
    }

    getDate() {
        return this._date;
    }

    private _setNewDate(newDate: Date) {
        if (this.getDate() !== newDate) {
            this.setDate(newDate);
            this.calendarDateChange.emit(newDate);
        }
    }

    private _applyPreviewDate() {
        if (this._previewDate && this.getDate() !== this._previewDate) {
            this._setNewDate(this._previewDate);
        }
    }
}
