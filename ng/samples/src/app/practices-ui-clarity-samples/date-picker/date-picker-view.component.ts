import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-date-picker-view',
    templateUrl: './date-picker-view.component.html',
    standalone: false
})
export class DatePickerViewComponent {
    formGroup = new FormGroup({
        birthdate: new FormControl<Date | null>(null),
        birthdateDisabled: new FormControl<Date | null>({ value: null, disabled: true }),
        birthdateRequired: new FormControl<Date | null>(null, Validators.required),
        withPlaceholder: new FormControl<Date | null>(null),
    });
}
