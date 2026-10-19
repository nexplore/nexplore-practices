import { effect, EffectRef, inject, Injector, runInInjectionContext, untracked } from '@angular/core';
import { unwrapSignalLike, ValueOrSignal } from '@nexplore/practices-ng-common-util';
import type { SignalFormGroup, SignalFormNode } from '../nodes/nodes';
import { trackingValues } from '../runtime/tracking-values';
import type { GroupValues } from '../types';

/**
 * Creates an effect that calls `effectFn` with the values of the form whenever one of the values it reads changes.
 *
 * Only runs once the form has been dirty at least once (like the Reactive Forms implementation).
 *
 * With `debounceTime`, the effect depends on all values and calls `effectFn` after the values were stable for that time.
 */
export function formFieldsChangeEffect<TForm extends SignalFormGroup<any>>(
    formSignalOrValue: ValueOrSignal<TForm>,
    effectFn: (value: GroupValues<TForm>) => void,
    options?: { debounceTime?: number }
): EffectRef {
    const injector = inject(Injector);
    let hasBeenDirty = false;
    return effect((onCleanup) => {
        const form = unwrapSignalLike(formSignalOrValue);
        if (form.dirty) {
            hasBeenDirty = true;
        }
        if (!hasBeenDirty) {
            return;
        }
        if (options?.debounceTime) {
            form.rawValueSignal();
            const handle = setTimeout(
                () => runInInjectionContext(injector, () => untracked(() => effectFn(trackingValues(form)))),
                options.debounceTime
            );
            onCleanup(() => clearTimeout(handle));
        } else {
            effectFn(trackingValues(form));
        }
    });
}

/**
 * Creates an effect that calls `effectFn` when the value of a control changes while the control is dirty.
 */
export function formControlChangeEffect<TValue>(
    control: ValueOrSignal<SignalFormNode<TValue>>,
    effectFn: (value: TValue) => void,
    options?: { debounceTime?: number }
): EffectRef {
    return effect((onCleanup) => {
        const node = unwrapSignalLike(control);
        const value = node.rawValue;
        if (!node.dirty) {
            return;
        }
        if (options?.debounceTime) {
            const handle = setTimeout(() => untracked(() => effectFn(value)), options.debounceTime);
            onCleanup(() => clearTimeout(handle));
        } else {
            untracked(() => effectFn(value));
        }
    });
}

