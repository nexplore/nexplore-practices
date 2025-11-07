
import { Component, forwardRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    Validator,
} from '@angular/forms';
import { ClarityModule, ClrDateInput } from '@clr/angular';

@Component({
    selector: 'puiclr-date-picker-input',
    imports: [ClarityModule, ReactiveFormsModule],
    standalone: true,
    template: `
        <div [formGroup]="form">
            <clr-date-container>
                <label [class]="'clr-control-label ' + labelClass">
                    <ng-content select="label"></ng-content>
                </label>
                <input
                    [class]="'clr-input ' + inputClass"
                    type="date"
                    formControlName="date"
                    [clrDate]="date"
                    (blur)="onTouched()"
                    (clrDateChange)="onDateChanged($event)"
                    [placeholder]="placeholder"
                />
                <clr-control-error>
                    <ng-content select="clr-control-error"></ng-content>
                </clr-control-error>
            </clr-date-container>
        </div>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatePickerInputComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DatePickerInputComponent),
            multi: true,
        },
    ],
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            clr-date-container label.clr-control-label > label {
                padding: 0;
            }
            clr-date-container .clr-input-wrapper {
                display: inline-block;
            }
        `,
    ],
})
export class DatePickerInputComponent implements ControlValueAccessor, Validator {
    @Input() labelClass = 'clr-col-12 clr-col-md-2';
    @Input() inputClass = '';
    @Input() placeholder: string = undefined;

    form = new FormGroup({
        date: new FormControl<Date | null>(null),
    });

    @ViewChild(ClrDateInput, { static: true }) dateInput: ClrDateInput;

    date: Date;

    control: AbstractControl;

    private _touchChangedHandler: () => {};
    private _dateChangedHandler: (_: Date) => void;

    onTouched() {
        if (this._touchChangedHandler) {
            this._touchChangedHandler();
        }
        this.triggerValidation();
    }

    onDateChanged(date: Date) {
        this.date = date;
        if (this._dateChangedHandler) {
            this._dateChangedHandler(date);
        }
        this.triggerValidation();
    }

    triggerValidation() {
        // We just need this to be async to work with the most current validity
        setTimeout(() => {
            if (this.control) {
                this.control.updateValueAndValidity();
            }
        });
    }

    validate(control: AbstractControl) {
        this.control = control;
        this.form.controls.date.setErrors(control.errors);
        return null;
    }

    writeValue(obj: any): void {
        setTimeout(() => {
            this.date = obj == null ? null : new Date(obj);
        });
    }

    registerOnChange(fn: any): void {
        this._dateChangedHandler = fn;
    }

    registerOnTouched(fn: any): void {
        this._touchChangedHandler = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.form.controls.date.disable();
        } else {
            this.form.controls.date.enable();
        }
    }
}
