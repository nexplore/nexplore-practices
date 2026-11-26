import { effect, EffectRef, inject, Injector, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlState, FormGroup, PristineChangeEvent } from '@angular/forms';
import { tryDestroyInjector, unwrapSignalLike, ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { computedPipe } from '@nexplore/practices-ng-signals';
import { debounceTime, filter, map, noop, startWith, switchMap, take, tap } from 'rxjs';
import { createFormValueSignalsProxyWithAutoTrackingDependencies } from './create-form-value-signals-proxy-with-auto-tracking-dependencies';
import { FormGroupValues, TypedFormGroup } from './form.types';

/**
 * Creates an effect function, that provides the value of the form as its first argument.
 *
 * **Only** the properties (control values) that are actually read in the `effectFn` will be observed.
 *
 * Also, The effect function will further only be called if the form control is dirty.
 *
 * @param formSignalOrValue The form control to listen to.
 * @param effectFn The function to call when the value changes.
 * @param options Additional options
 * - `debounceTime` The time in milliseconds to debounce the value changes. Default is NO debounce.
 */
export function formFieldsChangeEffect<
    TValue extends FormGroupValues<TForm>,
    TForm extends FormGroup = TypedFormGroup<TValue>,
>(
    formSignalOrValue: ValueOrSignal<TForm>,
    effectFn: (value: Exclude<TValue, FormControlState<any>>) => void,
    options?: { debounceTime?: number },
): EffectRef {
    const injector = inject(Injector);
    let currentInjector: Injector;
    let currentValue: TValue;
    let currentFormRef: AbstractControl;

    const formGotDirtyFirstTimeSignal = computedPipe(
        () => unwrapSignalLike(formSignalOrValue),
        switchMap((form) => form?.events),
        filter((ev) => ev instanceof PristineChangeEvent),
        options?.debounceTime ? debounceTime(options.debounceTime) : tap(noop),
        map((ev: PristineChangeEvent) => !ev.pristine),
        filter((dirty) => dirty),
        take(1),
        startWith(false),
    );

    return effect(() => {
        const form = unwrapSignalLike(formSignalOrValue);
        // If the form changes, create a new proxy
        if (currentFormRef !== form) {
            // Destroying the injector should stop the previous signals from being updated
            tryDestroyInjector(currentInjector);

            trace('formFieldsChangeEffect', 'New form object, creating new proxy', {
                form: form,
                valuesProxy: currentValue,
                currentInjector,
                currentFormRef,
            });

            currentInjector = Injector.create({ providers: [], parent: injector });

            currentValue = createFormValueSignalsProxyWithAutoTrackingDependencies(form, {
                injector: currentInjector,
                debounceTime: options?.debounceTime,
                filter: (control) => control.dirty,
            });

            currentFormRef = form;
        }

        if (currentValue && (formGotDirtyFirstTimeSignal() || form.dirty)) {
            trace('formFieldsChangeEffect', { currentValue, formStatus: form.status, form });
            effectFn(currentValue as any);
        }
    });
}

/**
 * Creates an effect that listens to value changes of a form control and calls the effect function.
 *
 * The effect function will only be called if the form control is dirty.
 *
 * @param control The form control to listen to.
 * @param effectFn The function to call when the value changes.
 * @param options The options to configure the effect.
 * - `debounceTime` The time in milliseconds to debounce the value changes. Default is NO debounce.
 */
export function formControlChangeEffect<TValue>(
    control: ValueOrSignal<AbstractControl<TValue>>,
    effectFn: (value: Exclude<TValue, FormControlState<any>>) => void,
    options?: { debounceTime?: number },
): EffectRef {
    const injector = inject(Injector);
    let currentInjector: Injector;
    let currentFormRef: AbstractControl;
    const INITIAL = {};
    let currentSignal: Signal<TValue | typeof INITIAL>;
    return effect(() => {
        const abstractControl = unwrapSignalLike(control);
        // If the form changes, create a new proxy
        if (currentFormRef !== abstractControl) {
            // Destroying the injector should stop the previous signals from being updated
            tryDestroyInjector(currentInjector);

            trace('formChangeEffect', 'New form object, creating new proxy', {
                abstractControl,
                currentInjector,
                currentFormRef,
            });

            currentInjector = Injector.create({ providers: [], parent: injector });

            currentSignal = untracked(() =>
                toSignal(
                    abstractControl.valueChanges.pipe(
                        filter(() => abstractControl.dirty),
                        options?.debounceTime ? debounceTime(options.debounceTime) : tap(noop),
                    ),
                    { injector: currentInjector, initialValue: INITIAL as any },
                ),
            );

            currentFormRef = abstractControl;
        }

        if (currentSignal) {
            const currentValue = currentSignal();
            if (currentValue !== INITIAL) {
                effectFn(currentValue as any);
            }
        }
    });
}

