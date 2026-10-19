import type { SignalFormGroup } from '../nodes/nodes';
import type { DeepKeyOfFormGroup, GroupValues } from '../types';
import type { ConditionalValidatorResult } from '../validation/validation-types';
import { validateMultiField } from '../validation/validators';

/**
 * Adds a validation that depends on multiple fields of the form group.
 * The errors are added to every field whose value is read (or to `controlNames` if given).
 *
 * ```ts
 * formGroup.withBuilder(...).withMultiFieldValidation(({ field1, field2 }) => !field1 && !field2 && { atLeastOneFieldRequired: true });
 * ```
 */
export function extendWithMultiFieldValidation<TFormGroup extends SignalFormGroup<any>>(
    this: TFormGroup,
    validator: (formValues: GroupValues<TFormGroup>) => ConditionalValidatorResult,
    controlNames?: Array<DeepKeyOfFormGroup<TFormGroup>>
): TFormGroup {
    this.addValidators(validateMultiField(this, validator, controlNames));
    return this;
}
