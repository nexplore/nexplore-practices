import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PuibeCheckboxComponent, PuibeCheckboxGroupComponent } from '@nexplore/practices-ui-ktbe';
import { delay, map, of } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-checkboxes',
    templateUrl: './checkboxes.component.html',
    imports: [PuibeCheckboxGroupComponent, PuibeCheckboxComponent, FormsModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxesComponent {
    private fb = inject(FormBuilder);

    mainForm = this.fb.group({
        basicWithoutGroup: this.fb.control<boolean>(null),
        basicWithoutGroupRequired: this.fb.control<boolean>(null, Validators.requiredTrue),
        basicWithoutGroupAsyncValidator: this.fb.control<boolean>(null, [], (c) =>
            of(c.value === 'bob')
                .pipe(delay(2000))
                .pipe(
                    map((result) => {
                        return !result ? { notBob: true } : null;
                    })
                )
        ),
        basic1: this.fb.control<boolean>(null),
        basic2: this.fb.control<boolean>(null),
        basic3: this.fb.control<boolean>(null),
        basic4: this.fb.control<boolean>(null),
        basic5: this.fb.control<boolean>(null),
        basicInline1: this.fb.control<boolean>(null),
        basicInline2: this.fb.control<boolean>(null),
        basicInline3: this.fb.control<boolean>(null),
        basicInline4: this.fb.control<boolean>(null),
        basicInline5: this.fb.control<boolean>(null),
        basicWithHint: this.fb.control<boolean>(null),
        required: this.fb.control<boolean>(null, Validators.requiredTrue),
        requiredInputWithInitialValue: this.fb.control<boolean>(true, Validators.requiredTrue),
        asyncValidator: this.fb.control<boolean>(null, [], (c) =>
            of(c.value === 'bob')
                .pipe(delay(2000))
                .pipe(
                    map((result) => {
                        return !result ? { notBob: true } : null;
                    })
                )
        ),
        disabled: this.fb.control<boolean>({ value: true, disabled: true }),
    });

    myCoolModel: number;
}
