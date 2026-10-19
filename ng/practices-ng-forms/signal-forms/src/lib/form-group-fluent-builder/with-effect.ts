import { effect, EffectRef, runInInjectionContext } from '@angular/core';
import type { SignalFormGroup } from '../nodes/nodes';

/**
 * Accepts either an `EffectRef`, or a function that is run as an effect with the form group as argument.
 */
export function extendWithEffect<TFormGroup extends SignalFormGroup<any>>(
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
