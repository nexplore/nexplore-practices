import type { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { unwrapSignalLike, ValueOrGetter } from '@nexplore/practices-ng-common-util';
import type { SignalFormGroup } from '../nodes/nodes';
import type { GroupValues, DeepKeyOfFormGroup } from '../types';
import type { ConditionalAsyncValidatorResult, ConditionalValidatorResult } from './validation-types';

/**
 * Metadata about validators that map onto native Signal Forms rules.
 * When a validator carries such a descriptor, the matching metadata (`required()`, `min()`, ...) is
 * also published on the field state.
 */
export type NativeRuleMeta = {
    required?: true;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
};

/** @internal */
export type ValidatorSpec =
    | { type: 'conditional'; compute: () => ConditionalValidatorResult }
    | { type: 'dependent'; form: ValueOrGetter<SignalFormGroup<any>>; compute: (values: any) => ConditionalValidatorResult }
    | { type: 'asyncConditional'; compute: () => ConditionalAsyncValidatorResult }
    | { type: 'multi'; form: ValueOrGetter<SignalFormGroup<any>>; compute: (values: any) => ConditionalValidatorResult; controlNames?: string[] }
    | { type: 'native'; meta: NativeRuleMeta };

const SPEC = Symbol('puiSignalFormsValidatorSpec');

type TaggedValidatorFn = ValidatorFn & { [SPEC]: ValidatorSpec };

function tag(fn: ValidatorFn, spec: ValidatorSpec): ValidatorFn {
    (fn as TaggedValidatorFn)[SPEC] = spec;
    return fn;
}

/** @internal */
export function getValidatorSpec(fn: unknown): ValidatorSpec | undefined {
    if (typeof fn !== 'function') {
        return undefined;
    }
    const spec = (fn as Partial<TaggedValidatorFn>)[SPEC];
    if (spec) {
        return spec;
    }
    // Plain Angular validators with a known identity map onto native rules as well
    if (fn === Validators.required) {
        return { type: 'native', meta: { required: true } };
    }
    return undefined;
}

const noop: ValidatorFn = () => null;

/**
 * Conditional validation based on signals read in the computation.
 *
 * Use within `withValidation(({ conditional }) => ...)`.
 * The computation is tracked by the signal form validation logic, so no effect is needed and
 * previous validators are replaced as soon as the computation changes.
 */
export function validateConditional(
    validatorsComputation: (() => ConditionalValidatorResult) | ValidatorFn[]
): ValidatorFn {
    return tag((_control: AbstractControl) => null, {
        type: 'conditional',
        compute: typeof validatorsComputation === 'function' ? validatorsComputation : () => validatorsComputation,
    });
}

/**
 * Conditional validation based on the values of the form group.
 *
 * `validators` receives the raw form value; every value read becomes a dependency of the validation.
 */
export function validateDependent<TForm extends SignalFormGroup<any>, TFormValue extends GroupValues<TForm>>(
    form: ValueOrGetter<TForm>,
    validators: (formValues: TFormValue) => ConditionalValidatorResult
): ValidatorFn {
    return tag(noop.bind(null) as ValidatorFn, { type: 'dependent', form, compute: validators });
}

/**
 * Creates a validator that validates multiple fields at once. The errors are added to each involved control.
 *
 * Without `controlNames`, the involved controls are those whose value is read by `validators`.
 * Register it with `formGroup.addValidators(...)`, or use `.withMultiFieldValidation()`.
 */
export function validateMultiField<TForm extends SignalFormGroup<any>, TFormValue extends GroupValues<TForm>>(
    form: ValueOrGetter<TForm>,
    validators: (formValues: TFormValue) => ConditionalValidatorResult,
    controlNames?: Array<DeepKeyOfFormGroup<TForm>>
): ValidatorFn {
    return tag(noop.bind(null) as ValidatorFn, {
        type: 'multi',
        form,
        compute: validators,
        controlNames: controlNames as string[] | undefined,
    });
}

/**
 * Async validators computed from signals.
 */
export function validateAsyncConditional(
    validatorsComputation: (() => ConditionalAsyncValidatorResult) | AsyncValidatorFn[]
): ValidatorFn {
    return tag(noop.bind(null) as ValidatorFn, {
        type: 'asyncConditional',
        compute: typeof validatorsComputation === 'function' ? validatorsComputation : () => validatorsComputation,
    });
}

/**
 * Adds one or more async validators to the control.
 *
 * Async validators only run while all synchronous validators pass. A new value cancels the pending run.
 */
export function validateAsync(...asyncValidators: AsyncValidatorFn[]): ValidatorFn {
    return validateAsyncConditional(asyncValidators);
}

/** @internal */
export function resolveValidatorsOfResult(result: ConditionalValidatorResult): ValidatorFn[] {
    const items = Array.isArray(result) ? result : [result];
    return items
        .filter((item): item is Exclude<typeof item, false | 0 | '' | null | undefined | 0n> => !!item)
        .flatMap((item) => (Array.isArray(item) ? (item as ValidatorFn[]) : [item]))
        .map((item) => (typeof item === 'function' ? (item as ValidatorFn) : (() => item as ValidationErrors)));
}

/** @internal */
export function resolveAsyncValidatorsOfResult(result: ConditionalAsyncValidatorResult): AsyncValidatorFn[] {
    const items = Array.isArray(result) ? result : [result];
    return items.filter((item): item is AsyncValidatorFn => typeof item === 'function');
}

/**
 * Drop-in counterparts of the Angular `Validators` that additionally publish native Signal Forms metadata
 * (`state.min()`, `state.minLength()`, `state.pattern()`, `state.required()`), which Reactive Forms validators cannot do
 * because they are opaque closures. They behave exactly like their Angular counterparts.
 */
export const PuiValidators = {
    required: Validators.required,
    requiredTrue: Validators.requiredTrue,
    email: Validators.email,
    min: (min: number): ValidatorFn => tag(Validators.min(min), { type: 'native', meta: { min } }),
    max: (max: number): ValidatorFn => tag(Validators.max(max), { type: 'native', meta: { max } }),
    minLength: (minLength: number): ValidatorFn =>
        tag(Validators.minLength(minLength), { type: 'native', meta: { minLength } }),
    maxLength: (maxLength: number): ValidatorFn =>
        tag(Validators.maxLength(maxLength), { type: 'native', meta: { maxLength } }),
    pattern: (pattern: string | RegExp): ValidatorFn =>
        tag(Validators.pattern(pattern), {
            type: 'native',
            meta: { pattern: typeof pattern === 'string' ? new RegExp(pattern.startsWith('^') ? pattern : `^${pattern}$`) : pattern },
        }),
} as const;

/** @internal */
export function unwrapForm<T>(form: ValueOrGetter<T>): T {
    return unwrapSignalLike(form);
}
