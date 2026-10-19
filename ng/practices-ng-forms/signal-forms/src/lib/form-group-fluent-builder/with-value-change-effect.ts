import { runInInjectionContext } from '@angular/core';
import type { SignalFormGroup } from '../nodes/nodes';
import type { GroupValues } from '../types';
import { formFieldsChangeEffect } from '../utils/form-effect-utils';

/**
 * Runs an effect when one of the form values changes. Only values actually read in `effectFn` trigger it.
 *
 * ```ts
 * formGroup.withBuilder(...).withValueChangeEffect(({ name }) => console.log(name));
 * ```
 */
export function extendWithValueChangeEffect<TFormGroup extends SignalFormGroup<any>>(
    this: TFormGroup,
    effectFn: (value: GroupValues<TFormGroup>) => void,
    options?: { debounceTime?: number }
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        formFieldsChangeEffect(this, effectFn, options);
    });
    return this;
}
