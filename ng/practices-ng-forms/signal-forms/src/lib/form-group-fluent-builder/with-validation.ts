import { runInInjectionContext } from '@angular/core';
import type { SignalFormGroup } from '../nodes/nodes';
import type { BoundValidators, ValidatorDefinition } from '../validation/validation-types';
import { validateAsync, validateAsyncConditional, validateConditional, validateDependent } from '../validation/validators';

/**
 * Adds validators to the controls of a form group.
 *
 * Either a record with the validators of each control, or a function that receives the special validators
 * `conditional`, `dependent`, `async` and `asyncConditional`.
 *
 * ```ts
 * formGroup.withBuilder(...).withValidation(({ conditional, dependent }) => ({
 *     name: [Validators.required],
 *     email: [conditional(() => this.isEmailRequiredSignal() && Validators.required), Validators.email],
 *     confirmPassword: [dependent(({ password, confirmPassword }) => password !== confirmPassword && { passwordsMustMatch: true })],
 * }));
 * ```
 */
export function extendWithValidation<TFormGroup extends SignalFormGroup<any>>(
    this: TFormGroup,
    validatorDefinitions:
        | ValidatorDefinition<TFormGroup['controls']>
        | ((validators: BoundValidators<TFormGroup>) => ValidatorDefinition<TFormGroup['controls']>)
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        const definitions =
            typeof validatorDefinitions === 'function'
                ? validatorDefinitions({
                      conditional: validateConditional,
                      dependent: (fn: any) => validateDependent(this, fn),
                      async: validateAsync,
                      asyncConditional: validateAsyncConditional,
                  })
                : validatorDefinitions;

        for (const [key, validators] of Object.entries(definitions)) {
            this.get(key)?.addValidators(...(Array.isArray(validators) ? validators : [validators as any]));
        }
    });
    return this;
}
