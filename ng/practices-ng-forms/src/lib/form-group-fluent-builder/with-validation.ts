import {runInInjectionContext} from '@angular/core';
import {configureFormValidationsEffect} from '../validation/validation-effect.utils';
import {BoundValidators, ValidatorDefinition} from '../validation/validation-types';
import {FormControlsOfGroup} from './form-group-types.internal';
import {FormGroupEnhancedWithSignals} from './types';

/**
 * Extends the form group with validation definitions.
 *
 * Either accepts an record object with validation definitions for each control or a function that receives as arguments a set of special validators that can be used for conditional signal based validation.
 *
 * Example:
 * ```ts
 * protected readonly isEmailRequiredSignal = signal<boolean>(false);
 * protected readonly myForm = formGroup.with...()
 *   .withValidation(({conditional, dependent}) => ({
 *       name: [Validators.required],
 *       email: [
 *          conditional(() => this.isEmailRequiredSignal() && Validators.required),
 *          Validators.email
 *       ],
 *       password: [Validators.required, Validators.minLength(8)],
 *       confirmPassword: [
 *          Validators.required,
 *          dependent(({password, confirmPassword}) => password !== confirmPassword && {passwordsMustMatch: true})
 *       ],
 *     })
 *   );
 * ```
 *
 * @param validatorDefinitions The validation definitions for the form group.
 */
export function extendWithValidation<TFormGroup extends FormGroupEnhancedWithSignals>(
    this: TFormGroup,
    validatorDefinitions:
        | ValidatorDefinition<FormControlsOfGroup<TFormGroup>>
        | ((validators: BoundValidators<TFormGroup>) => ValidatorDefinition<FormControlsOfGroup<TFormGroup>>)
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        configureFormValidationsEffect(this, validatorDefinitions);
    });

    return this;
}
