import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PuibeRadioButtonComponent, PuibeRadioButtonGroupComponent } from '@nexplore/practices-ui-ktbe';
import { delay, map, of } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-radio-buttons',
    templateUrl: './radio-buttons.component.html',
    imports: [PuibeRadioButtonGroupComponent, PuibeRadioButtonComponent, FormsModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonsComponent {
    mainForm = this.fb.group({
        basic: this.fb.control<string>(null),
        basicWithHint: this.fb.control<string>(null),
        required: this.fb.control<string>(null, Validators.required),
        requiredInputWithInitialValue: this.fb.control<string>('2', Validators.required),
        asyncValidator: this.fb.control<string>(null, [], (c) =>
            of(c.value === 'bob')
                .pipe(delay(2000))
                .pipe(
                    map((result) => {
                        return !result ? { notBob: true } : null;
                    })
                )
        ),
        disabled: this.fb.control<string>({ value: '3', disabled: true }),
    });

    myCoolModel: number;

    constructor(private fb: FormBuilder) {}
}
