import { trace } from '@nexplore/practices-ng-logging';
import { getPuiFormDirectiveForFormGroup } from '../form-field/form.directive';
import type { SignalFormArray, SignalFormGroup } from '../nodes/nodes';

/**
 * Marks all controls in a form group or array (recursively) as touched.
 *
 * If the form group is attached to a `PuiFormDirective`, the directive is used so that the form fields are notified as well.
 */
export function markAllAsTouched(formGroup: SignalFormGroup<any> | SignalFormArray<any>): void {
    trace('markAllAsTouched', { formGroup });

    const attachedDirective = getPuiFormDirectiveForFormGroup(formGroup);
    if (attachedDirective) {
        attachedDirective.markAsTouched();
        return;
    }

    formGroup.markAllAsTouched();
}
