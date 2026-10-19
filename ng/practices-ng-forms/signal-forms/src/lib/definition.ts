import type { AsyncValidatorFn, ValidatorFn } from '@angular/forms';

/**
 * The event a control updates its model on. `'blur'` is implemented with the Signal Forms `debounce(path, 'blur')` rule.
 * `'submit'` is accepted for source compatibility but behaves like `'change'`.
 */
export type UpdateOn = 'change' | 'blur' | 'submit';

export type ControlOptions = {
    validators?: ValidatorFn | ValidatorFn[] | null;
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;
    updateOn?: UpdateOn;
    nonNullable?: boolean;
    disabled?: boolean;
};

export type GroupOptions = Pick<ControlOptions, 'validators' | 'asyncValidators'>;

export type ControlState<T> = { value: T; disabled: boolean };

type NormalizedOptions = {
    validators: ValidatorFn[];
    asyncValidators: AsyncValidatorFn[];
    updateOn?: UpdateOn;
    nonNullable: boolean;
    disabled: boolean;
};

function toArray<T>(value: T | T[] | null | undefined): T[] {
    return value == null ? [] : Array.isArray(value) ? value : [value];
}

function isOptionsObject(value: unknown): value is ControlOptions {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        ('validators' in value ||
            'asyncValidators' in value ||
            'updateOn' in value ||
            'nonNullable' in value ||
            'disabled' in value)
    );
}

function normalizeOptions(
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): NormalizedOptions {
    const opts: ControlOptions = isOptionsObject(validatorOrOpts)
        ? validatorOrOpts
        : { validators: validatorOrOpts as ValidatorFn | ValidatorFn[] | null | undefined };
    return {
        validators: toArray(opts.validators),
        asyncValidators: [...toArray(opts.asyncValidators), ...toArray(asyncValidator)],
        updateOn: opts.updateOn,
        nonNullable: opts.nonNullable ?? false,
        disabled: opts.disabled ?? false,
    };
}

/** Definition of a leaf control (holds one value). */
export class ControlDef<T> {
    readonly kind = 'control' as const;
    readonly options: NormalizedOptions;

    constructor(
        readonly initialValue: T,
        options?: ControlOptions | NormalizedOptions
    ) {
        this.options = normalizeOptions(options as ControlOptions);
    }
}

/** Definition of a group of named children. */
export class GroupDef<TControls extends Record<string, AnyDef>> {
    readonly kind = 'group' as const;
    readonly options: NormalizedOptions;

    constructor(
        readonly controls: TControls,
        options?: ControlOptions
    ) {
        this.options = normalizeOptions(options);
    }
}

/** Definition of a list of items that can grow and shrink. */
export class ArrayDef<TItem extends AnyDef> {
    readonly kind = 'array' as const;
    readonly options: NormalizedOptions;

    constructor(
        readonly items: TItem[],
        options?: ControlOptions
    ) {
        this.options = normalizeOptions(options);
    }
}

export type AnyDef = ControlDef<any> | GroupDef<any> | ArrayDef<any>;

export type DefValue<TDef> = TDef extends ControlDef<infer V>
    ? V
    : TDef extends GroupDef<infer C>
    ? { [K in keyof C]: DefValue<C[K]> }
    : TDef extends ArrayDef<infer I>
    ? DefValue<I>[]
    : never;

export function isDef(value: unknown): value is AnyDef {
    return value instanceof ControlDef || value instanceof GroupDef || value instanceof ArrayDef;
}

/**
 * The builder passed to definition functions, a replacement for Angular's `FormBuilder` with the same call shapes.
 * It creates plain definitions instead of controls; the signal form tree is built from them.
 */
export class SignalFormBuilder {
    /**
     * Creates a control definition. Like `FormBuilder.control`, the value type includes `null` unless `nonNullable: true` is set.
     */
    control<T>(formState: T | ControlState<T>, opts: ControlOptions & { nonNullable: true }): ControlDef<T>;
    control<T>(
        formState: T | ControlState<T>,
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
    ): ControlDef<T | null>;
    control<T>(
        formState: T | ControlState<T>,
        validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null,
        asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
    ): ControlDef<T | null> {
        const options = normalizeOptions(validatorOrOpts, asyncValidator);
        if (isControlState(formState)) {
            return new ControlDef<T | null>(formState.value, { ...options, disabled: formState.disabled });
        }
        return new ControlDef<T | null>(formState, options);
    }

    group<TControls extends Record<string, AnyDef>>(
        controls: TControls,
        options?: ControlOptions | null
    ): GroupDef<TControls> {
        return new GroupDef(controls, options ?? undefined);
    }

    array<TDef extends AnyDef>(items: TDef[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null): ArrayDef<TDef>;
    array<T>(items: T[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null): ArrayDef<ControlDef<T | null>>;
    array(items: unknown[], validatorOrOpts?: ValidatorFn | ValidatorFn[] | ControlOptions | null): ArrayDef<AnyDef> {
        return new ArrayDef(
            items.map((item) => (isDef(item) ? item : new ControlDef(item))),
            normalizeOptions(validatorOrOpts) as ControlOptions
        );
    }
}

function isControlState(value: unknown): value is ControlState<unknown> {
    return typeof value === 'object' && value !== null && Object.keys(value).length === 2 && 'value' in value && 'disabled' in value;
}
