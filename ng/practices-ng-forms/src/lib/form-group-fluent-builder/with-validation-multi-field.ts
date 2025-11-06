import {runInInjectionContext} from '@angular/core';
import {ConditionalValidatorResult} from "../validation/validation-internal.util";
import {FormGroupEnhancedWithSignals} from './types';
import { validateMultiField } from '../validation/validators';
import {DeepKeyOfFormGroup, FormGroupValues} from '../utils/form.types';

/**
 * Extends the form group with a multi-field validation.
 *
 * This allows to define a validation that depends on multiple fields of the form group.
 *
 * Example:
 * ```ts
 * protected readonly myForm = formGroup.with...()
 *  .withMultiFieldValidation(({field1, field2}) => !field1 && !field2 && { atLeastOneFieldRequired: true });
 * ```
 *
 * You can chain multiple calls to `withMultiFieldValidation` to add multiple multi-field validations.
 */
export function extendWithMultiFieldValidation<TFormGroup extends FormGroupEnhancedWithSignals>(
    this: TFormGroup,
    validator: (formValues: FormGroupValues<TFormGroup>) => ConditionalValidatorResult,
    controlNames?: Array<DeepKeyOfFormGroup<TFormGroup>>
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        const validatonFn = validateMultiField(this, validator, controlNames);
        this.addValidators(validatonFn);
    });

    return this;
}
