import { runInInjectionContext } from '@angular/core';
import { FormControlState } from '@angular/forms';
import { FormGroupValues } from '../utils/form.types';
import { FormGroupEnhancedWithSignals } from './types';
import { formFieldsChangeEffect } from '../utils/form-effect-utils';

/**
 * Extends the form group with an effect that is triggered when one of the form fields change.
 *
 * Only the fields that are actually read in the effect function will trigger the effect.
 *
 * Example:
 * ```ts
 * protected readonly myForm = formGroup.withBuilder(() => ({
 *    name: '',
 *    age: 0,
 * }).withValueChangeEffect(({name}) => {
 *   console.log(`Name changed to ${name}`);
 * });
 * ```
 *
 * @param effectFn The effect function that will be triggered when one of the form fields change.
 * @param options Options for the effect.
 */
export function extendWithValueChangeEffect<TFormGroup extends FormGroupEnhancedWithSignals>(
    this: TFormGroup,
    effectFn: (value: Exclude<FormGroupValues<TFormGroup>, FormControlState<any>>) => void,
    options?: { debounceTime?: number }
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        formFieldsChangeEffect(this, effectFn, options);
    });

    return this;
}
