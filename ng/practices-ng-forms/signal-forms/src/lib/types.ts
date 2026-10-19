import type { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import type { AnyDef, ArrayDef, ControlDef, GroupDef, SignalFormBuilder, UpdateOn } from './definition';
import type { ControlsValues, NodeValue, SignalFormArray, SignalFormControl, SignalFormGroup } from './nodes/nodes';

export type { NodeValue, ControlsValues };

/** Makes all properties in T nullable. */
export type Nullable<T> = { [P in keyof T]: T[P] | null };
export type PartialNullable<T> = Partial<Nullable<T>>;
export type DtoPropsOnly<T> = Omit<T, 'init' | 'toJSON'>;

export interface INswagGeneratedType {
    init(_data?: any): void;
    toJSON(data?: any): any;
}

/** The (enabled) value of a form group. */
export type GroupValues<TForm> = TForm extends SignalFormGroup<infer TControls> ? ControlsValues<TControls> : never;
export type FormGroupValues<TForm> = GroupValues<TForm>;
export type FormGroupControlsValues<TControls> = ControlsValues<TControls>;
export type FormControlValue<TNode> = NodeValue<TNode>;

export type FormValueSignalsRecordWithoutPostfix<TFormValue> = {
    [key in keyof TFormValue]: import('@angular/core').Signal<TFormValue[key]>;
};

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

/** All dotted paths to controls of a form group. */
export type DeepKeyOfFormGroup<T extends SignalFormGroup<any>> = (
    [T] extends [never]
        ? ''
        : T extends SignalFormGroup<infer TControls>
        ? {
              [K in Exclude<keyof TControls, symbol>]: `${K}${DotPrefix<
                  TControls[K] extends SignalFormGroup<any> ? DeepKeyOfFormGroup<TControls[K]> : ''
              >}`;
          }[Exclude<keyof TControls, symbol>]
        : ''
) extends infer D
    ? Extract<D, string>
    : never;

// ---- definitions

/** Same options as `FormBuilder.control`, in the short "value + flags" form. */
export type FormControlDefinition<T> = {
    value: T;
    disabled?: boolean;
    /** The event the control updates its model on. */
    updateOn?: UpdateOn;
    /**
     * Whether the control allows `null` and resets to `null`. When `false` (default) it resets to its initial value
     * and its type does not include `null`.
     */
    nullable?: boolean;
    validators?: ValidatorFn[];
    asyncValidators?: AsyncValidatorFn[];
};

export type FormControlDefinitionValueOmitted = Omit<FormControlDefinition<never>, 'value'>;

export type FormGroupDefinitionRecord<TValue extends FormGroupValueBase> = {
    [K in keyof TValue]: FormControlDefinition<TValue[K]> | FormControlDefinitionValueOmitted;
};

export type FormGroupValueBase = Record<string, any>;

export type BuildFromGroupValueFn<TValue extends FormGroupValueBase> = (
    builder: SignalFormBuilder
) => FormGroupDefinitionRecord<TValue>;

export type FormGroupDefinition<TValue extends FormGroupValueBase> =
    | TValue
    | BuildFromGroupValueFn<TValue>
    | FormGroupDefinitionRecord<TValue>;

export type ValueSatisfyingType<
    TSatisfiesType extends FormGroupValueBase,
    TValue extends PartialNullable<TSatisfiesType>
> = {
    [KEY in keyof TValue]: TValue[KEY] extends null
        ? KEY extends string
            ? TSatisfiesType extends { [K in KEY]: infer TPropValue }
                ? TPropValue | null
                : TValue[KEY] | unknown
            : TValue[KEY]
        : TValue[KEY];
};

type AddNullableIfConfigured<TControlDef, TFallback = TControlDef> = TControlDef extends AnyDef
    ? DefValue<TControlDef>
    : TControlDef extends FormControlDefinition<infer TValue> & { nullable: true }
    ? TValue | null
    : TControlDef extends FormControlDefinition<infer TValue>
    ? TValue
    : TControlDef extends FormControlDefinitionValueOmitted & { nullable: true }
    ? TFallback | null
    : TControlDef extends FormControlDefinitionValueOmitted & { nullable: false }
    ? TFallback
    : Exclude<TControlDef, FormControlDefinitionValueOmitted>;

type DefValue<TDef> = TDef extends ControlDef<infer V>
    ? V
    : TDef extends GroupDef<infer C>
    ? { [K in keyof C]: DefValue<C[K]> }
    : TDef extends ArrayDef<infer I>
    ? DefValue<I>[]
    : never;

type MapNullable<TDefinition, THintType> = {
    [K in keyof TDefinition]: AddNullableIfConfigured<TDefinition[K], K extends keyof THintType ? THintType[K] : never>;
};

/** The facade node type that matches a definition entry. */
type NodeOfEntry<TEntry, THint> = TEntry extends ControlDef<infer V>
    ? SignalFormControl<V>
    : TEntry extends GroupDef<infer C>
    ? SignalFormGroup<{ [K in keyof C]-?: NodeOfEntry<C[K], never> }>
    : TEntry extends ArrayDef<infer I>
    ? SignalFormArray<NodeOfEntry<I, never>>
    : SignalFormControl<AddNullableIfConfigured<TEntry, THint>>;

type NodesOfRecord<TRecord, THintType> = {
    [K in keyof TRecord]-?: NodeOfEntry<TRecord[K], K extends keyof THintType ? THintType[K] : never>;
};

type RecordOfDefinition<TDefinition> = TDefinition extends (builder: SignalFormBuilder) => infer TRecord
    ? TRecord
    : TDefinition extends () => infer TRecord
    ? TRecord
    : TDefinition;

export type ExtractActualValueFromDefinition<
    TDefinitionInput extends FormGroupDefinition<FormGroupValueBase>,
    THintType
> = MapNullable<RecordOfDefinition<TDefinitionInput>, THintType>;

export type FormGroupDefinitionValue<
    TDefinition extends FormGroupDefinition<FormGroupValueBase>,
    THintType
> = ExtractActualValueFromDefinition<TDefinition, THintType>;

/** The controls of a form group whose value is `TValues`: one `SignalFormControl` per property. */
export type FormControlsOfValues<TValues> = TValues extends Record<string, any>
    ? { [K in keyof TValues]-?: SignalFormControl<TValues[K]> }
    : never;

export type AllPropsAMustBeInB<A, B> = keyof A extends keyof B ? A : never;

/** A form group with the signals and fluent `with...()` methods. */
export type FormGroupEnhancedWithSignals<TControls extends object = any> = SignalFormGroup<TControls>;

export type TypedExtendedFormGroup<
    TDefinition extends FormGroupDefinition<FormGroupValueBase> = FormGroupDefinition<FormGroupValueBase>,
    THintType = never
> = SignalFormGroup<NodesOfRecord<RecordOfDefinition<TDefinition>, THintType>>;

export type FormGroupSatisfyingTypeOfValue<
    TSatisfiesType extends FormGroupValueBase,
    TValue extends PartialNullable<TSatisfiesType>
> = SignalFormGroup<FormControlsOfValues<ValueSatisfyingType<TSatisfiesType, TValue>>>;

type PickRightNullability<TValue, TOriginal> = TValue extends null
    ? TValue extends TOriginal
        ? TValue
        : TOriginal | null
    : TValue extends undefined
    ? TValue extends TOriginal
        ? TValue
        : TOriginal | undefined
    : TValue extends TOriginal
    ? TValue
    : TOriginal extends TValue
    ? TOriginal | null
    : TOriginal;

/**
 * Makes sure that if a value is defined with null, it gets the original type added to it:
 * `{ prop2: null }` with an original `prop2: string` has the type `string | null`.
 */
export type DefinitionWithNullValuesInferredFromValue<TDefinition, TOriginal> = TDefinition extends FormGroupDefinition<
    infer TValue
>
    ? FormGroupDefinition<{
          [K in keyof TValue]: TDefinition extends { [P in K]: any }
              ? TOriginal extends { [P in K]?: any }
                  ? TValue[K] extends FormControlDefinitionValueOmitted
                      ? AddNullableIfConfigured<TDefinition[K], TOriginal[K]>
                      : PickRightNullability<TValue[K], TOriginal[K]>
                  : TValue[K]
              : Exclude<TValue[K], FormControlDefinitionValueOmitted>;
      }>
    : never;

export type ValueSatisfying<
    TValueOrDef extends PartialNullable<TSatisfy> | FormGroupDefinitionRecord<PartialNullable<TSatisfy>>,
    TSatisfy extends FormGroupValueBase
> = TValueOrDef extends FormGroupDefinitionRecord<any>
    ? ExtractActualValueFromDefinition<DefinitionWithNullValuesInferredFromValue<TValueOrDef, TSatisfy>, TSatisfy>
    : TValueOrDef extends PartialNullable<TSatisfy>
    ? ValueSatisfyingType<TSatisfy, TValueOrDef>
    : never;
