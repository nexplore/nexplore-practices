import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PuiFormFieldService } from '@nexplore/practices-ng-forms';
import { map } from 'rxjs';
import { PuibeTooltipButtonComponent } from '../tooltip/tooltip.component';
import { RadioButtonGroupService } from './radio-button-group.service';

let nextUniqueId = 0;

@Component({
    standalone: true,
    selector: 'puibe-radio-button',
    templateUrl: './radio-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, ReactiveFormsModule, AsyncPipe, NgIf, PuibeTooltipButtonComponent],
})
export class PuibeRadioButtonComponent {
    @Input()
    value: any;

    @Input()
    label: string;

    @Input()
    description: string;

    @Input()
    descriptionAsTooltip = false;

    uniqueId = `radio-button-${nextUniqueId++}`;

    name$ = this._radioButtonGroupService.name$;
    checked$ = this._formFieldService.value$.pipe(
        map((v) => v != null && JSON.stringify(v) === JSON.stringify(this.value))
    );

    isRequired$ = this._formFieldService.isRequired$;

    invalid$ = this._formFieldService.invalid$;
    displayAsInvalid$ = this._formFieldService.displayAsInvalid$;
    disabled$ = this._formFieldService.disabled$;

    constructor(
        private _radioButtonGroupService: RadioButtonGroupService,
        private _formFieldService: PuiFormFieldService
    ) {}

    markAsTouched() {
        this._formFieldService.markAsTouched();
    }

    setValueInGroup() {
        this._radioButtonGroupService.setValue(this.value);
    }
}
