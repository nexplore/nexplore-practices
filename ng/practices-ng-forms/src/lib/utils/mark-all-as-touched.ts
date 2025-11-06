import { FormArray, FormGroup } from '@angular/forms';
import { trace } from '@nexplore/practices-ng-logging';
import { getPuiFormDirectiveForFormGroup } from '../form-field/form.directive';

/**
 * Marks all controls in a form group as touched.
 *
 * Recursively marks all controls in nested form groups and form arrays as touched.
 *
 * If the form group is attached to a `PuiFormDirective`, the directive will be used to mark the controls as touched.
 */
export function markAllAsTouched(formGroup: FormGroup | FormArray): void {
    trace('markAllAsTouched', { formGroup });

    const attachedDirective = getPuiFormDirectiveForFormGroup(formGroup);
    if (attachedDirective) {
        trace('markAllAsTouched', 'Using attached directive to mark as touched', { attachedDirective });
        attachedDirective.markAsTouched();
        return;
    }

    Object.values(formGroup.controls).forEach((control) => {
        if (control instanceof FormGroup) {
            markAllAsTouched(control);
        } else if (control instanceof FormArray) {
            control.controls.forEach((c) => {
                if (c instanceof FormGroup || c instanceof FormArray) {
                    markAllAsTouched(c);
                } else {
                    c.markAsTouched();
                    c.updateValueAndValidity();
                }
            });
        }

        control.markAsTouched();
        control.updateValueAndValidity();
    });
}
