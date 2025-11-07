import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PuiFormFieldService } from '@nexplore/practices-ng-forms';
import { map } from 'rxjs';
import { RadioButtonGroupService } from './radio-button-group.service';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'pui-radio-button',
    templateUrl: './radio-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ReactiveFormsModule, AsyncPipe],
})
export class PuiRadioButtonComponent {
    private _radioButtonGroupService = inject(RadioButtonGroupService);
    private _formFieldService = inject(PuiFormFieldService);

    @Input()
    value: any;

    @Input()
    label: string;

    @Input()
    description: string;

    uniqueId = `radio-button-${nextUniqueId++}`;

    name$ = this._radioButtonGroupService.name$;
    checked$ = this._formFieldService.value$.pipe(
        map((v) => v != null && JSON.stringify(v) === JSON.stringify(this.value)),
    );

    isRequired$ = this._formFieldService.isRequired$;

    invalid$ = this._formFieldService.invalid$;
    displayAsInvalid$ = this._formFieldService.displayAsInvalid$;
    disabled$ = this._formFieldService.disabled$;

    markAsTouched() {
        this._formFieldService.markAsTouched();
    }

    setValueInGroup() {
        this._radioButtonGroupService.setValue(this.value);
    }
}

