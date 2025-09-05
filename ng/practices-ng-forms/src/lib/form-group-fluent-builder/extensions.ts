import { effect, inject, Injector, runInInjectionContext, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormControlOptions,
    FormGroup,
    PristineChangeEvent,
    TouchedChangeEvent,
} from '@angular/forms';
import { trace } from '@nexplore/practices-ng-logging';
import { filter, map, Observable } from 'rxjs';
import { formValueSignalsDependencyTracker } from '../utils/form-value-signals-dependency-tracker';
import {
    FormControlDefinition,
    FormControlDefinitionValueOmitted,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupValueBase,
    TypedExtendedFormGroup,
} from './types';
import { extendWithEffect } from './with-effect';
import { extendWithResetFromSignal } from './with-reset-from-signal';
import { extendWithValidation } from './with-validation';
import { extendWithMultiFieldValidation } from './with-validation-multi-field';
import { extendWithValueChangeEffect } from './with-value-change-effect';

export const extensions = {
    withResetFromSignal: extendWithResetFromSignal,
    withValidation: extendWithValidation,
    withMultiFieldValidation: extendWithMultiFieldValidation,
    withValueChangeEffect: extendWithValueChangeEffect,
    withEffect: extendWithEffect,
};

export type Extensions = typeof extensions;

function toFormControlOptions<T>(
    controlDef: FormControlDefinition<T> | FormControlDefinitionValueOmitted
): FormControlOptions {
    return {
        validators: [],
        asyncValidators: [],
        updateOn: controlDef.updateOn,
    };
}

function updateFormGroupDefinition(
    controlDefs: FormGroupDefinitionRecord<any> | undefined,
    formGroup: FormGroup,
    formBuilder: FormBuilder
) {
    if (!controlDefs) {
        return;
    }

    Object.entries(controlDefs).forEach(
        ([key, controlDef]: [
            string,
            AbstractControl<any> | FormControlDefinition<any> | FormControlDefinitionValueOmitted
        ]) => {
            if (controlDef instanceof AbstractControl) {
                formGroup.addControl(key, controlDef);
            } else {
                if (formGroup.contains(key)) {
                    const existingControl = formGroup.get(key)!;

                    const needsToRecreateControl =
                        (controlDef.updateOn ?? existingControl.updateOn) !== existingControl.updateOn;

                    const value = 'value' in controlDef ? controlDef.value : existingControl.value;

                    if (needsToRecreateControl) {
                        formGroup.setControl(key, formBuilder.control(value, controlDef));
                    } else {
                        if (existingControl.value !== value) {
                            existingControl.reset(value);
                        }

                        if (existingControl.disabled !== !!controlDef.disabled) {
                            if (controlDef.disabled) {
                                existingControl.disable();
                            } else {
                                existingControl.enable();
                            }
                        }
                    }
                } else {
                    formGroup.addControl(
                        key,
                        formBuilder.control(
                            'value' in controlDef ? controlDef.value : undefined,
                            toFormControlOptions(controlDef)
                        )
                    );
                }
            }
        }
    );

    Object.entries(formGroup.controls).forEach(([key, control]) => {
        if (!(key in controlDefs)) {
            control.reset();
            control.disable();
        }
    });
}

function isFormControlDefinition(value: any): value is FormControlDefinition<any> {
    return (
        typeof value === 'object' &&
        value !== null &&
        ('value' in value || 'disabled' in value || 'updateOn' in value || 'nullable' in value)
    );
}

/**
 * @internal
 * Creates a form group from a definition, adding extended functionality to the standard Angular form group.
 *
 * The definition can be a function that takes a form builder and returns a definition, or a plain object.
 *
 * The extended functionality consists of:
 * - Signals for all form control values, status, dirty, pristine, valid, invalid, touched, and untouched.
 * - builder style extensions for adding effects, validations, and more.
 *
 * @param definition The definition of the form group.
 * @param config Optional configuration.
 */
export function createExtendedFormGroup<TDefinition extends FormGroupDefinition<FormGroupValueBase>>(
    definition: TDefinition,
    config?: {
        injector?: Injector;
    }
): TypedExtendedFormGroup<TDefinition> & Extensions {
    const injector = config?.injector ?? inject(Injector);

    let formGroup: FormGroup<any>;

    if (typeof definition === 'function') {
        const formBuilder = inject(FormBuilder);
        const formBuilderProxy = new Proxy(formBuilder, {
            get(target, prop, receiver) {
                const result = Reflect.get(target, prop, receiver);
                if (typeof result === 'function') {
                    return result.bind(formBuilder);
                } else {
                    return result;
                }
            },
        });
        formGroup = new FormGroup({});

        try {
            const controlDefs = definition(formBuilderProxy);
            updateFormGroupDefinition(controlDefs, formGroup, formBuilder);
        } catch (e) {
            trace(
                'createExtendedFormGroup',
                'Error when calling intial definition, this might happen when reading signals and should not be a problem.',
                e
            );
        }

        runInInjectionContext(injector, () => {
            effect(() => {
                // TODO: Can we find a way to prevent this from running twice initially? Not really a big deal
                const controlDefs = definition(formBuilderProxy);
                updateFormGroupDefinition(controlDefs, formGroup, formBuilder);
            });
        });
    } else {
        const controls = Object.keys(definition).reduce((acc, key) => {
            if (isFormControlDefinition(definition[key])) {
                const controlDef = definition[key] as FormControlDefinition<any>;
                (acc as any)[key] = new FormControl(controlDef.value, toFormControlOptions(controlDef));
            } else {
                (acc as any)[key] = new FormControl(definition[key]);
            }
            return acc;
        }, {});

        formGroup = new FormGroup(controls);
    }
    const formSignals = formValueSignalsDependencyTracker(formGroup, { injector });
    const statusSignalMap = new Map<string, Signal<any>>();

    function getSignalForObservable<T>(key: string, observable: Observable<T>, initialValue: T): Signal<T> {
        if (!statusSignalMap.has(key)) {
            const signal = runInInjectionContext(injector, () =>
                untracked(() => toSignal(observable, { initialValue }))
            );
            statusSignalMap.set(key, signal);
        }
        return statusSignalMap.get(key)!;
    }

    const SIGNAL_POSTFIX = 'Signal';
    // TODO: Consider refactor from proxy to a inherited class, or another solution. Not that proxies are bad, but they are not a well known pattern.
    const formGroupProxy = new Proxy<any>(formGroup, {
        get: (target, prop, receiver) => {
            switch (prop) {
                case 'value':
                    return new Proxy(Reflect.get(target, prop, receiver), {
                        get: (target, prop, receiver) => {
                            const asksForSignal = typeof prop === 'string' && prop.endsWith(SIGNAL_POSTFIX);

                            if (asksForSignal) {
                                return formSignals.getOrCreateSignalForControl(prop.slice(0, -SIGNAL_POSTFIX.length));
                            } else {
                                return Reflect.get(target, prop, receiver);
                            }
                        },
                    });
                case 'statusSignal':
                    return getSignalForObservable('status', formGroup.statusChanges, formGroup.status);
                case 'dirtySignal':
                    return getSignalForObservable(
                        'dirty',
                        formGroup.events.pipe(
                            filter((ev) => ev instanceof PristineChangeEvent),
                            map((ev) => !ev.pristine)
                        ),
                        formGroup.dirty
                    );
                case 'pristineSignal':
                    return getSignalForObservable(
                        'pristine',
                        formGroup.events.pipe(
                            filter((ev) => ev instanceof PristineChangeEvent),
                            map((ev) => ev.pristine)
                        ),
                        formGroup.pristine
                    );
                case 'validSignal':
                    return getSignalForObservable(
                        'valid',
                        formGroup.statusChanges.pipe(map((status) => status === 'VALID')),
                        formGroup.valid
                    );
                case 'invalidSignal':
                    return getSignalForObservable(
                        'invalid',
                        formGroup.statusChanges.pipe(map((status) => status === 'INVALID')),
                        formGroup.invalid
                    );
                case 'touchedSignal':
                    return getSignalForObservable(
                        'touched',
                        formGroup.events.pipe(
                            filter((ev) => ev instanceof TouchedChangeEvent),
                            map((ev) => ev.touched)
                        ),
                        formGroup.touched
                    );
                case 'untouchedSignal':
                    return getSignalForObservable(
                        'untouched',
                        formGroup.events.pipe(
                            filter((ev) => ev instanceof TouchedChangeEvent),
                            map((ev) => !ev.touched)
                        ),
                        formGroup.untouched
                    );

                case 'injector':
                    return injector;
                default: {
                    const extension = extensions[prop as keyof Extensions];
                    if (extension) {
                        return extension.bind(formGroupProxy as any);
                    }
                    return Reflect.get(target, prop, receiver);
                }
            }
        },
    });

    return formGroupProxy;
}
