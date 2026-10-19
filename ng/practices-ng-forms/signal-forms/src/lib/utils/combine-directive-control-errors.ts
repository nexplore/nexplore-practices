import type { ValidationErrors } from '@angular/forms';
import type { AnyNode, SignalFormArray, SignalFormGroup } from '../nodes/nodes';

/**
 * Combines the errors of all controls below a node into a single `ValidationErrors` record.
 */
export function combineDirectiveControlErrors(form: AnyNode | SignalFormGroup<any>): ValidationErrors | null {
    if (!form.invalid) {
        return null;
    }
    if (form.kind === 'group') {
        const controls = Object.values((form as SignalFormGroup<any>).controls) as AnyNode[];
        return { ...form.errors, ...Object.fromEntries(controls.flatMap((c) => Object.entries(c.errors ?? {}))) };
    }
    if (form.kind === 'array') {
        const controls = (form as SignalFormArray<any>).controls as AnyNode[];
        return { ...form.errors, ...Object.fromEntries(controls.flatMap((c) => Object.entries(c.errors ?? {}))) };
    }
    return form.errors;
}
