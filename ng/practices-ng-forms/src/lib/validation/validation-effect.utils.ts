import { effect, EffectRef, inject, Injector, isSignal, runInInjectionContext, Signal } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { BoundValidators, ValidatorDefinition } from './validation-types';
import { validateAsync, validateAsyncConditional, validateConditional, validateDependent, } from './validators';

/**
 * Creates an effect that configures the validators of a form group.
 *
 * This allows separation of the form configuration from the validation logic.
 * For simple forms, this is not necessary, but as soon as we have `dependent` or `conditional` validators, this is absolutely necessary to ensure the type-checker works correctly.
 *
 * Example 1:
 * ```ts
 * readonly mainForm = withEffects(
 *     new FormGroup({
 *         validFrom: new FormControl<Date | null>(null),
 *         type: new FormControl<HousingSituationType | null>(null),
 *         cohabitationType: new FormControl<LabelDto | null>(null),
 *         organization: new FormControl<OrganizationDto | null>(null),
 *         careLevel: new FormControl<number | null>(null),
 *     }),
 *     (form) => configureFormValidationsEffect(form, ({conditional, dependent}) => ({
 *         validFrom: conditional(() => this.showValidFromSignal() && Validators.required),
 *         type: Validators.required,
 *         cohabitationType: [],
 *         organization: conditional(() => this.showOrganizationsSignal() && Validators.required),
 *         careLevel: [
 *             CustomValidators.integer(),
 *             Validators.min(0),
 *             Validators.max(12),
 *             dependent(({organization}) => organization?.onCareList && Validators.required),
 *         ],
 *       })
 *     ),
 * );
 * ```
 *
 * @param form The form group to configure the validators for.
 * @param validatorDefinitions An object containing the control names and their validators, or a function that returns such an object and receives the bound validators as argument, which can be used to create dependent validators.
 */
export function configureFormValidationsEffect<TControls extends { [K in keyof TControls]: AbstractControl<any, any> }>(
    form: FormGroup<TControls> | Signal<FormGroup<TControls>> | (() => FormGroup<TControls>),
    validatorDefinitions: NoInfer<
        | ValidatorDefinition<TControls>
        | ((validators: BoundValidators<FormGroup<TControls>>) => ValidatorDefinition<TControls>)
    >
): EffectRef {
    const injector = inject(Injector);
    return effect(() => {
        const unwrappedFormGroup = isSignal(form) || typeof form === 'function' ? form() : form;

        runInInjectionContext(injector, () => {
            if (typeof validatorDefinitions === 'function') {
                // Bind the validators to the form
                validatorDefinitions = validatorDefinitions({
                    conditional: validateConditional,
                    dependent: (arg1: any) => validateDependent(form, arg1),
                    async: validateAsync,
                    asyncConditional: validateAsyncConditional,
                });
            }
        });

        Object.entries(validatorDefinitions).forEach(([key, validator]) => {
            const control = (unwrappedFormGroup.controls as any)[key] as AbstractControl;
            control.addValidators(validator as ValidatorFn);
            control.updateValueAndValidity();
        });
    });
}

