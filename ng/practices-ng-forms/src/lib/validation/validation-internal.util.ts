import { effect, EffectRef, isSignal, Signal } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { wrapArrayAndFilterFalsyValues } from '@nexplore/practices-ng-common-util';
import { Falsy } from 'rxjs';

export type ControlProvider =
    | AbstractControl[]
    | AbstractControl
    | Signal<AbstractControl | Array<AbstractControl | Falsy> | Falsy>
    | (() => AbstractControl | Array<AbstractControl | Falsy> | Falsy);

export type ConditionalValidatorResult = ValidatorFn | ValidatorFn[] | Falsy | ValidationErrors;
export type ConditionalAsyncValidatorResult = AsyncValidatorFn | AsyncValidatorFn[] | Falsy;

/**
 * @internal
 * Creates an effect that adds or removes validators to a control based on a condition.
 *
 * Whenever the validators change, the previous ones will be removed.
 *
 * Example:
 * ```ts
 *  // This is just a example signal
 *  readonly isEmailRequiredSignal = input(false, { alias: 'isEmailRequired' });
 *
 *  readonly registrationForm = new FormGroup({
 *      email: new FormControl<string | null>(null),
 *  });
 *
 *  readonly emailRequiredEffect = conditionalValidationEffect(this.registrationForm.controls.email, () =>
 *      this.isEmailRequiredSignal() && Validators.required // Add the required validator if the isEmailRequiredSignal is set to `true`
 *  );
 * ```
 *
 * @param formControls The control to add or remove validators from.
 *
 * Can be a single control or an array of controls. Can also be a signal.
 *
 * If the signal returns `false`, the validators will be removed.
 *
 * @param validatorProviders A function that will be run as a effect, and should return the validators to add, or null/false if none.
 *
 * Accepts an array of validators as well.
 *
 * @returns An effect reference.
 */
export function conditionalValidationEffect(
    formControls: ControlProvider,
    validatorProviders: (() => ConditionalValidatorResult) | ValidatorFn[]
): EffectRef {
    let lastValidators: ValidatorFn[] = [];
    let lastControlsArray: AbstractControl[] = [];
    return effect(() => {
        const controlValue =
            isSignal(formControls) || typeof formControls === 'function' ? formControls() : formControls;
        const newControlsArray = wrapArrayAndFilterFalsyValues(controlValue);
        const newValidators = wrapArrayAndFilterFalsyValues(
            typeof validatorProviders === 'function' ? validatorProviders() : validatorProviders
        ).flatMap((validator) =>
            validator instanceof Array
                ? (validator as ValidatorFn[])
                : typeof validator === 'function'
                ? ([validator] as ValidatorFn[])
                : ([() => validator] as ValidatorFn[])
        );
        const hasValidatorsChanged =
            newValidators.length !== lastValidators.length ||
            lastValidators.some((lastValidator, i) => newValidators[i] !== lastValidator);
        const hasControlsChanged =
            newControlsArray.length !== lastControlsArray.length ||
            newControlsArray.some((control, i) => control !== lastControlsArray[i]);
        if (hasValidatorsChanged || hasControlsChanged) {
            lastControlsArray.forEach((control) => {
                if (
                    lastValidators.some(
                        (validator) => !newValidators.includes(validator) && control.hasValidator(validator)
                    )
                ) {
                    control.removeValidators(lastValidators!);
                    control.updateValueAndValidity();
                }
            });

            if (newValidators.length) {
                newControlsArray.forEach((control) => {
                    if (newValidators.some((validator) => !control.hasValidator(validator))) {
                        control.addValidators(newValidators);
                        control.updateValueAndValidity();
                    }
                });
            }
        }

        lastValidators = newValidators;
        lastControlsArray = newControlsArray;
    });
}

/**
 * @internal
 * Like `conditionalValidationEffect`, but for async validators.
 */
export function conditionalAsyncValidationEffect(
    formControls: ControlProvider,
    validators: (() => ConditionalAsyncValidatorResult) | AsyncValidatorFn[]
): EffectRef {
    let lastValidators: AsyncValidatorFn[] = [];
    let lastControlsArray: AbstractControl[] = [];
    return effect(() => {
        const controlValue =
            isSignal(formControls) || typeof formControls === 'function' ? formControls() : formControls;
        const newControlsArray = wrapArrayAndFilterFalsyValues(controlValue);
        let newValidators = typeof validators === 'function' ? validators() : validators;
        newValidators = wrapArrayAndFilterFalsyValues(newValidators);
        const hasValidatorsChanged =
            newValidators.length !== lastValidators.length ||
            lastValidators.some((lastValidator, i) => newValidators[i] !== lastValidator);
        const hasControlsChanged =
            newControlsArray.length !== lastControlsArray.length ||
            newControlsArray.some((control, i) => control !== lastControlsArray[i]);
        if (hasValidatorsChanged || hasControlsChanged) {
            lastControlsArray.forEach((control) => {
                if (
                    lastValidators.some(
                        (validator) => !newValidators.includes(validator) && control.hasAsyncValidator(validator)
                    )
                ) {
                    control.removeAsyncValidators(lastValidators!);
                    control.updateValueAndValidity();
                }
            });

            if (newValidators.length) {
                newControlsArray.forEach((control) => {
                    if (newValidators.some((validator) => !control.hasAsyncValidator(validator))) {
                        control.addAsyncValidators(newValidators);
                        control.updateValueAndValidity();
                    }
                });
            }
        }

        lastValidators = newValidators;
        lastControlsArray = newControlsArray;
    });
}
