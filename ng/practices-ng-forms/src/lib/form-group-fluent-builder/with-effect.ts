import { effect, EffectRef, runInInjectionContext } from '@angular/core';
import { FormGroupEnhancedWithSignals } from './types';

/**
 * Accepts either an EffectRef, or a function that will be run as an effect, with the form group as an argument.
 *
 * Example:
 * ```typescript
 * protected readonly myForm = formGroup.with....().
 *   .withEffect(form => {
 *     const valid = form.validSignal();
 *     ....
 *   });
 * ```
 *
 * @param effectRefOrFn The effect to run
 */
export function extendWithEffect<TFormGroup extends FormGroupEnhancedWithSignals>(
    this: TFormGroup,
    effectRefOrFn: EffectRef | ((form: TFormGroup) => void)
): TFormGroup {
    if (typeof effectRefOrFn === 'function') {
        runInInjectionContext(this.injector, () => {
            effect(() => effectRefOrFn(this));
        });
    }
    return this;
}
