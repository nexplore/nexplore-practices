import { computed, isSignal, Signal } from '@angular/core';
import { ValueOrSignal } from '@nexplore/practices-ng-common-util';
import type { AnyNode, SignalFormGroup } from '../nodes/nodes';
import type { GroupValues } from '../types';

/**
 * Creates a signal that holds the value of a form group while it is dirty (and the initial value otherwise).
 * Equal values are filtered out by the signal.
 */
export function formGroupValueChangesSignal<TForm extends SignalFormGroup<any>>(
    formGroup: ValueOrSignal<TForm>,
    options: { initialValue: Partial<GroupValues<TForm>> | null | object } = { initialValue: {} }
): Signal<Partial<GroupValues<TForm>>> {
    let last = options.initialValue as Partial<GroupValues<TForm>>;
    type Result = Partial<GroupValues<TForm>>;
    return computed(() => {
        const form = isSignal(formGroup) ? formGroup() : formGroup;
        const value = form.valueSignal() as Result;
        if (form.dirty) {
            last = value;
        }
        return last;
    });
}

/**
 * Creates a signal that holds the current value of a form group, optionally mapped to the given control names.
 */
export function formGroupCurrentValueMappedSignal<TForm extends SignalFormGroup<any>, TResult = GroupValues<TForm>>(
    formGroup: ValueOrSignal<TForm>,
    options?: {
        controlNames?: Array<keyof GroupValues<TForm>>;
        filter?: (values: GroupValues<TForm>) => boolean;
        map?: (values: GroupValues<TForm>) => TResult;
    }
): Signal<TResult> {
    let last: TResult | undefined;
    return computed(() => {
        const form = isSignal(formGroup) ? formGroup() : formGroup;
        let value: any = form.valueSignal();
        if (options?.controlNames) {
            value = Object.fromEntries(options.controlNames.map((name) => [name, value[name]]));
        }
        if (options?.filter && !options.filter(value)) {
            return last as TResult;
        }
        last = (options?.map ? options.map(value) : value) as TResult;
        return last;
    });
}

/** Creates a signal that holds the current value of a form group. */
export function formGroupCurrentValueSignal<TForm extends SignalFormGroup<any>>(
    formGroup: ValueOrSignal<TForm>
): Signal<GroupValues<TForm>> {
    return formGroupCurrentValueMappedSignal(formGroup);
}

/** Creates a signal that holds the current value of a form control (or any node). */
export function formControlCurrentValueSignal<TValue>(
    formControl: ValueOrSignal<{ valueSignal: Signal<TValue> } & AnyNode>
): Signal<TValue> {
    return computed(() => (isSignal(formControl) ? formControl() : formControl).valueSignal());
}
