import { effect, EffectRef, inject, Injector, runInInjectionContext, untracked } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { tryDestroyInjector, unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';

import { trace } from '@nexplore/practices-ng-logging';
import { createFormValueSignalsProxyWithAutoTrackingDependencies } from '../utils/create-form-value-signals-proxy-with-auto-tracking-dependencies';
import { DeepKeyOfFormGroup, FormGroupValues } from '../utils/form.types';
import { getControlsByNamesOfFormGroup } from './util-internal';
import {
    conditionalAsyncValidationEffect,
    ConditionalAsyncValidatorResult,
    conditionalValidationEffect,
    ConditionalValidatorResult,
} from './validation-internal.util';

/**
 * Conditional validation based on a effect computation.
 *
 * Internally, creates an effect, **MUST BE RUN WITHIN A INJECTION CONTEXT** (E.g. in component constructor)
 *
 * ONLY USE in combination with `configureFormValidationsEffect`
 *
 * Whenever the validators change, the previous ones will be removed.
 *
 * Example:
 * ```ts
 * // This is just a example signal
 * readonly isEmailRequiredSignal = input(false, { alias: 'isEmailRequired' });
 *
 * readonly registrationForm = withEffects(
 *  new FormGroup({
 *     email: new FormControl<string | null>(null),
 *  });
 *  form => {
 *   configureFormValidationsEffect(form, {
 *     email: validateConditional(() => this.isEmailRequiredSignal() && Validators.required),
 *   });
 *  }
 * );
 * ```
 *
 * @param validatorsComputation A function that will be run as a effect, and should return the validators to add, or null/false if none.
 */
export function validateConditional(
    validatorsComputation: (() => ConditionalValidatorResult) | ValidatorFn[]
): ValidatorFn {
    const controlsEffectsMap = new Map<AbstractControl, EffectRef>();
    const injector = inject(Injector);

    return (control) => {
        if (!controlsEffectsMap.has(control)) {
            controlsEffectsMap.set(
                // The same validator may be added to multiple controls
                control,
                untracked(() =>
                    runInInjectionContext(injector, () => conditionalValidationEffect(control, validatorsComputation))
                )
            );
        }

        return null; // The validation is not done here, but in the effect, essentially, this is a noop validator
    };
}

/**
 * Conditional validation based on the values of the form group.
 *
 * Every property that is read within the `validators` function, will create a signal that will recompute the validators whenever the value changes.
 *
 * Internally, creates an effect, **MUST BE RUN WITHIN A INJECTION CONTEXT** (E.g. in component constructor)
 *
 * ONLY USE in combination with `configureFormValidationsEffect`
 *
 * Whenever the validators change, the previous ones will be removed.
 *
 * Example:
 * ```ts
 * readonly formGroup = withEffects(
 *   new FormGroup({
 *     email: new FormControl<string | null>(null),
 *     isEmailRequired: new FormControl<boolean>(false),
 *   }),
 *   form => {
 *     configureFormValidationsEffect(form, {
 *       email: validateDependent(form, value => value.isEmailRequired && [Validators.required]), // Validator is computed whenever `isEmailRequired` changes
 *     })
 *   }
 * );
 * ```
 */
export function validateDependent<TForm extends FormGroup, TFormValue extends FormGroupValues<TForm>>(
    formValueOrSignal: ValueOrGetter<TForm>,
    validators: (formValues: TFormValue) => ConditionalValidatorResult
): ValidatorFn {
    const injector = inject(Injector);
    let currentInjector: Injector;
    let valuesProxy: TFormValue;
    let currentFormRef: TForm;
    return validateConditional(() => {
        const form = unwrapSignalLike(formValueOrSignal);

        // If the form changes, create a new proxy
        if (currentFormRef !== formValueOrSignal) {
            // Destroying the injector should stop the previous signals from being updated
            tryDestroyInjector(currentInjector);

            trace('CustomValidators', 'dependent', 'New form object, creating new proxy', {
                form,
                valuesProxy,
                currentInjector,
                currentFormRef,
            });

            currentInjector = Injector.create({ providers: [], parent: injector });
            valuesProxy = createFormValueSignalsProxyWithAutoTrackingDependencies<TForm, TFormValue>(form, {
                injector: currentInjector,
            });
            currentFormRef = form;
        }

        return validators(valuesProxy);
    });
}

/**
 * Creates a validator that validates multiple fields at once.
 *
 * NOTE: Use this function only in combination with `configureFormValidationsEffect`.
 *
 * The `validators` function will be run whenever the form values change, and should return the validators to add, or null/false if none.
 *
 * The `controlNames` parameter can be used to specify the controls that should be validated.
 * If no control names are specified, the controls will be implicitly determined by the dependency-usages of the `validators` function.
 *
 * Example:
 * ```ts
 * protected readonly form = withEffects(
 *  new FormGroup({
 *     email: new FormControl<string | null>(null),
 *     password: new FormControl<string | null>(null),
 *     confirmPassword: new FormControl<string | null>(null),
 *     isPasswordRequired: new FormControl<boolean>(false),
 *  }),
 *  form => {
 *   configureFormValidationsEffect(this.form, {
 *     ...
 *   },
 *   [
 *    validateMultiField(
 *        this.form,
 *        ({ password, confirmPassword }) => {  // By reading the `password` and `confirmPassword` properties here, those controls will automatically tracked as dependencies as well as validated.
 *            const invalid = (password && confirmPassword && password !== confirmPassword);
 *            return invalid && CustomValidators.returnError('passwordsDoNotMatch'); // Error will be added to both `password` and `confirmPassword`
 *        })
 *   ]);
 *  }
 * );
 *
 * @param form The form group to validate, or a signal that returns the form group.
 * @param validators A function that will be run as a effect, and should return the validators to add, or null/false if none. The parameters are the values of the form group, and reading any property will act like a signal read, thus updating the validators whenever the value changes.
 * @param controlNames (optional) The names of the controls that should be validated. If not specified, the controls will be implicitly determined by the dependency-usages of the `validators` function.
 */
export function validateMultiField<TForm extends FormGroup, TFormValue extends FormGroupValues<TForm>>(
    form: ValueOrGetter<TForm>,
    validators: (formValues: TFormValue) => ConditionalValidatorResult,
    controlNames?: Array<DeepKeyOfFormGroup<TForm>>
): ValidatorFn {
    const injector = inject(Injector);
    let currentInjector: Injector;
    let valuesProxy: TFormValue;
    let currentFormRef: TForm;
    const autoTrackedDependencies: Array<AbstractControl> = [];
    const validatedControls = new Set<AbstractControl>();

    effect(() => {
        form = unwrapSignalLike(form);

        // If the form changes, create a new proxy
        if (currentFormRef !== form) {
            // Destroying the injector should stop the previous signals from being updated
            tryDestroyInjector(currentInjector);

            trace('CustomValidators', 'multiField', 'New form object, creating new proxy', {
                form,
                valuesProxy,
                currentInjector,
                currentFormRef,
                autoTrackedDependencies,
                controlNames,
            });

            autoTrackedDependencies.splice(0, autoTrackedDependencies.length);
            currentInjector = Injector.create({ providers: [], parent: injector });
            valuesProxy = createFormValueSignalsProxyWithAutoTrackingDependencies<TForm, TFormValue>(form, {
                injector: currentInjector,
                onTrackDependencyHandler: (key, control) => {
                    trace('CustomValidators', 'multiField', 'Tracking new dependency', key);
                    autoTrackedDependencies.push(control);
                },
            });
            currentFormRef = form;

            // Run the validators initially, to ensure the dependencies can be tracked
            validators(valuesProxy);
        }

        const controlsToValidate = controlNames?.length
            ? controlNames.map((controlName: string) => {
                  return getControlsByNamesOfFormGroup(form as TForm, controlName.split('.')).map((c) => c.control)[0];
              })
            : autoTrackedDependencies;

        controlsToValidate.forEach((control, index) => {
            if (!validatedControls.has(control)) {
                trace('CustomValidators', 'multiField', index, 'Adding validators to control', {
                    control,
                    valuesProxy,
                    autoTrackedDependencies,
                    controlNames,
                });
                untracked(() => {
                    runInInjectionContext(currentInjector, () =>
                        conditionalValidationEffect(control, () => validators(valuesProxy))
                    );
                });

                validatedControls.add(control);
            }
        });
    });

    return () => {
        return null; // The validation is not done here, but in the effect, essentially, this is a noop validator
    };
}

/**
 * Same as `validateConditional`, but for async validators.
 *
 * To be used within a `configureFormValidationsEffect`.
 */
export function validateAsyncConditional(
    validatorsComputation: (() => ConditionalAsyncValidatorResult) | AsyncValidatorFn[]
): ValidatorFn {
    const controlsEffectsMap = new Map<AbstractControl, EffectRef>();
    const injector = inject(Injector);

    return (control) => {
        if (!controlsEffectsMap.has(control)) {
            controlsEffectsMap.set(
                // The same validator may be added to multiple controls
                control,
                untracked(() =>
                    runInInjectionContext(injector, () =>
                        conditionalAsyncValidationEffect(control, validatorsComputation)
                    )
                )
            );
        }

        return null; // The validation is not done here, but in the effect, essentially, this is a noop validator
    };
}

/**
 * Adds one or more async validator to the control.
 *
 * To be used within a `configureFormValidationsEffect`.
 */
export function validateAsync(...asyncValidators: AsyncValidatorFn[]): ValidatorFn {
    return validateAsyncConditional(asyncValidators);
}
