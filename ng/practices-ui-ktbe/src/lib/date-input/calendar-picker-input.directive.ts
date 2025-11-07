import { Overlay } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Input, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { isValid } from 'date-fns/isValid';
import { takeUntil } from 'rxjs';
import { FormFieldService } from '../form-field/form-field.service';
import { PuibeIconDatepickerComponent } from '../icons/icon-datepicker.component';
import { setHostAttr } from '../util/utils';
import { PuibeCalendarPickerAnchorDirective } from './calendar-picker-anchor.directive';
import { AllowedViewModesArray } from './calendar/calendar.component';
import { PuibeCalendarPeriodValidationService } from './services/calendar-period-validation.service';
import { CalendarPeriodType, DateInput, PuibeCalendarPeriodService } from './services/calendar-period.service';

@Directive({
    standalone: true,
    selector: 'input[puibeCalendarPickerInput]',
    providers: [
        DestroyService,
        Overlay,
        DatePipe,
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => PuibeCalendarPickerInputDirective),
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PuibeCalendarPickerInputDirective),
            multi: true,
        },
    ],
})
/** @internal */
export class PuibeCalendarPickerInputDirective implements OnInit, ControlValueAccessor, Validator {
    protected readonly _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
    protected readonly _formFieldService = inject(FormFieldService);
    protected readonly _destroy$ = inject(DestroyService);
    protected readonly _calendarPeriodService = inject(PuibeCalendarPeriodService);
    protected readonly _datepipe = inject(DatePipe);
    protected readonly _translate = inject(TranslateService);
    protected readonly _calendarPicker = inject(PuibeCalendarPickerAnchorDirective);
    protected readonly _validationService = inject(PuibeCalendarPeriodValidationService);

    @HostListener('change')
    onChange() {
        this._setNewDate(this._parseCurrentInputValue());
    }

    @HostListener('keydown', ['$event'])
    onKeydown(ev: KeyboardEvent) {
        if (ev.code?.startsWith('Key') && !ev.altKey && !ev.ctrlKey) {
            ev.preventDefault();
        } else if (ev.code === 'Enter' || ev.code === 'Space') {
            this._setDatePickerValue(this._parseCurrentInputValue());
        }
    }

    @HostListener('focus')
    onFocus() {
        this._updateAriaDescription();
    }

    private _date: Date;
    private _onChangeHandler: (date: DateInput) => void;
    private _onTouched: () => void;

    @Input() type: CalendarPeriodType = 'date';

    @Input() helpDescriptionKey = 'Practices.Labels_DatePicker_HelpDescription';

    // eslint-disable-next-line @typescript-eslint/member-ordering
    @Input() getModelValueHandler: (date: Date | null) => DateInput = (date) => date;

    constructor() {
        const _elementRef = this._elementRef;

        setHostAttr('type', false, _elementRef);
        setHostAttr('inputmode', 'numeric', _elementRef);

        this._updateAriaDescription();
    }

    configure(options: {
        type: CalendarPeriodType;
        helpDescriptionKey: string;
        getModelValueHandler?: (date: Date | null) => DateInput;
        calendarAllowedViewModes: AllowedViewModesArray;
    }) {
        this.type = options.type;
        this.helpDescriptionKey = options.helpDescriptionKey;
        this.getModelValueHandler = options.getModelValueHandler ?? this.getModelValueHandler;
        setTimeout(() => {
            // Timeout is needed as the calendar picker directive initializes its inputs after the constructor
            if (!this._calendarPicker.calendarAllowedViewModes) {
                this._calendarPicker.calendarAllowedViewModes = options.calendarAllowedViewModes;
            }
        });
    }

    ngOnInit(): void {
        this._formFieldService.setFocusedPlaceholder(this._calendarPeriodService.getFormatPlaceholder(this.type));

        this._formFieldService.setReadonlyValueFunction(() => this.getReadOnlyValue());

        this._formFieldService.setIcon({
            component: PuibeIconDatepickerComponent,
            fill: true,
            clickable: !this._calendarPicker.disableCalendar,
            invert: true,
            title: this._translate.instant('Practices.Labels_DatePicker_Open'),
        });

        this._formFieldService.iconClick$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            this._calendarPicker.openOverlay({ side: 'end', initiator: 'button' });
        });

        this._calendarPicker.calendarDateChange.pipe(takeUntil(this._destroy$)).subscribe((date) => {
            this._date = date;
            this._setInputValue(date);
            this._onChangeNgModel(date);
        });

        this._calendarPicker.calendarOpenChange.pipe(takeUntil(this._destroy$)).subscribe((_open) => {
            // Timeout so the description is not read out, in case focus is shifting to the datepicker overlay
            setTimeout(() => {
                this._updateAriaDescription();
            });
        });
    }

    getReadOnlyValue() {
        const value = this.getModelValueHandler(this._date);
        if (isValid(value)) {
            return this._datepipe.transform(value);
        } else {
            return null;
        }
    }

    writeValue(date: DateInput): void {
        this._date = this._calendarPeriodService.parse(this.type, date, { strict: true });
        this._setDatePickerValue(this._date);
        this._setInputValue(this._date);
    }

    registerOnChange(fn: any): void {
        this._onChangeHandler = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this._calendarPicker.closeOverlay();
        setHostAttr('disabled', isDisabled, this._elementRef);
    }

    validate() {
        return (
            this._validationService.validateInputForPartialValue(this._elementRef.nativeElement, {
                periodType: this.type,
            }) ??
            this._validationService.validateMinMax(this._date, {
                periodType: this.type,
                min: this._calendarPicker.min,
                max: this._calendarPicker.max,
            })
        );
    }

    private _parseCurrentInputValue(): Date {
        return this._calendarPeriodService.parse(this.type, this._elementRef.nativeElement.value, { strict: true });
    }

    private _updateAriaDescription() {
        // Compose a description text based upon the current state.
        const descriptions = [
            this._elementRef.nativeElement.value,
            'Practices.Labels_DatePicker_Input_Format',
            !this._calendarPicker.disableCalendar &&
                !this._calendarPicker.disableCalendarKeyboardActivation &&
                !this._calendarPicker.isOpen() &&
                'Practices.Labels_DatePicker_Input_Keyboard',
            !this._calendarPicker.disableCalendar &&
                !this._calendarPicker.disableCalendarKeyboardActivation &&
                this._calendarPicker.isOpen() &&
                'Practices.Labels_DatePicker_KeyboardSubmit',
            this._calendarPicker.isOpen() && this.helpDescriptionKey,
        ];

        const description = descriptions
            .filter(Boolean)
            .map((key) =>
                this._translate.instant(key, { format: this._calendarPeriodService.getFormatPlaceholder(this.type) })
            )
            .join('\n');

        this._formFieldService.setAriaDescription(description);
    }

    private _setInputValue(date: Date) {
        this._elementRef.nativeElement.value =
            this._calendarPeriodService.format(
                this.type,
                this._calendarPeriodService.parse(this.type, date, { strict: true })
            ) ?? '';
    }

    private _setDatePickerValue(date: Date) {
        this._calendarPicker.setDate(date);
    }

    private _setNewDate(newDate: Date) {
        if (this._date !== newDate) {
            this._date = newDate;
            this._setDatePickerValue(this._date);
            this._setInputValue(this._date);
            this._onChangeNgModel(this._date);
        }
        this._onTouched();
    }

    private _onChangeNgModel(date: Date) {
        if (this._onChangeHandler) {
            if (!isValid(date)) {
                date = null; // Ensure no invalid dates are emitted
            }

            const modelValue = this.getModelValueHandler(date);
            this._onChangeHandler(modelValue);
        }
    }
}
