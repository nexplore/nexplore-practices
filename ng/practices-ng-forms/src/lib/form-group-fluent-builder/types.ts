import { Injector, Signal } from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormBuilder,
    FormControlStatus,
    FormGroup,
    ValidatorFn,
} from '@angular/forms';
import { FormGroupControlsValues, FormValueSignalsRecordWithoutPostfix, PartialNullable } from '../utils/form.types';
import { Extensions } from './extensions';
import { FormGroupValueWithSignals } from './form-group-types';
import { FormControlsOfValues } from './form-group-types.internal';

export type FormGroupEnhancedWithSignals<TControls = any> = TControls extends {
    [K in keyof TControls]: AbstractControl;
}
    ? FormGroup<TControls> & {
          /**
           * The injector associated with this form group. It was used for all the effects and signals created for this form group.
           */
          readonly injector: Injector;

          /**
           * Returns the current value of the form group, enhanced with signals for each control.
           *
           * Deprecation notice: Accessing `formGroup.value` to get signals for individual controls is deprecated.
           * Please use `formGroup.valueSignal` instead to access signals for individual controls.
           */
          readonly value: FormGroupValueWithSignals<TControls>;

          /**
           * A signal of the most up-to-date value of the form group.
           *
           * Additionally, if you need signals for individual controls, use `formGroup.valueSignal.controlName` instead.
           *
           * @example
           * ```ts
           * const formGroup = formGroup.withConfig(...);
           *
           * const fullValue = formGroup.valueSignal(); // gets the full value of the form group (Emits whenever any control changes)
           * const individualControlValue = formGroup.valueSignal.controlName(); // gets the value of 'controlName' control (as a signal, emits only when that control changes)
           * ```
           */
          readonly valueSignal: FormValueSignalsRecordWithoutPostfix<FormGroupControlsValues<TControls>> &
              Signal<FormGroupControlsValues<TControls>>;

          readonly statusSignal: Signal<FormControlStatus>;
          readonly dirtySignal: Signal<boolean>;
          readonly pristineSignal: Signal<boolean>;
          readonly touchedSignal: Signal<boolean>;
          readonly untouchedSignal: Signal<boolean>;
          readonly validSignal: Signal<boolean>;
          readonly invalidSignal: Signal<boolean>;
      }
    : never;

export type FormGroupValueBase = Record<string, any>;

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

export type FormGroupSatisfyingTypeOfValue<
    TSatisfiesType extends FormGroupValueBase,
    TValue extends PartialNullable<TSatisfiesType>
> = FormGroupEnhancedWithSignals<FormControlsOfValues<ValueSatisfyingType<TSatisfiesType, TValue>>>;

export type FormControlDefinition<T> = {
    value: T;

    disabled?: boolean;

    /**
     * The event name for control to update upon.
     */
    updateOn?: 'change' | 'blur' | 'submit';

    nullable?: boolean;

    validators?: ValidatorFn[];

    asyncValidators?: AsyncValidatorFn[];
};

export type FormControlDefinitionValueOmitted = {
    disabled?: boolean;

    /**
     * The event name for control to update upon.
     */
    updateOn?: 'change' | 'blur' | 'submit';

    nullable?: boolean;

    validators?: ValidatorFn[];

    asyncValidators?: AsyncValidatorFn[];
};

export type FormGroupDefinitionRecord<TValue extends FormGroupValueBase> = {
    [K in keyof TValue]:
        | AbstractControl<TValue[K]>
        | FormControlDefinition<TValue[K]>
        | FormControlDefinitionValueOmitted;
};

export type BuildFromGroupValueFn<TValue extends FormGroupValueBase> = (
    builder: FormBuilder
) => FormGroupDefinitionRecord<TValue>;

type AddNullableIfConfigured<TControlDef, TFallback = TControlDef> = TControlDef extends FormControlDefinition<
    infer TValue
> & {
    nullable: true;
}
    ? TValue | null
    : TControlDef extends FormControlDefinitionValueOmitted & { nullable: true }
    ? TFallback | null
    : TControlDef extends FormControlDefinitionValueOmitted & { nullable: false }
    ? TFallback
    : TControlDef extends FormControlDefinition<infer TValue>
    ? TValue
    : TControlDef extends AbstractControl<infer TValue>
    ? TValue
    : Exclude<TControlDef, FormControlDefinitionValueOmitted>;

type MapNullable<TDefinition, THintType> = {
    [K in keyof TDefinition]: AddNullableIfConfigured<TDefinition[K], K extends keyof THintType ? THintType[K] : never>;
};

export type FormGroupDefinitionValue<
    TDefinition extends FormGroupDefinition<FormGroupValueBase>,
    THintType
> = TDefinition extends BuildFromGroupValueFn<infer TValue> ? TValue : MapNullable<TDefinition, THintType>;

export type FormGroupDefinition<TValue extends FormGroupValueBase> =
    | TValue
    | BuildFromGroupValueFn<TValue>
    | FormGroupDefinitionRecord<TValue>;

export type ExtractActualValueFromDefinition<
    TDefinitionInput extends FormGroupDefinition<FormGroupValueBase>,
    THintType
> = TDefinitionInput extends ((_: FormBuilder) => infer TDefinition) | (() => infer TDefinition)
    ? MapNullable<TDefinition, THintType>
    : FormGroupDefinitionValue<TDefinitionInput, THintType>;

export type TypedExtendedFormGroup<
    TDefinition extends FormGroupDefinition<FormGroupValueBase> = FormGroupDefinition<FormGroupValueBase>,
    THintType = never
> = FormGroupEnhancedWithSignals<FormControlsOfValues<ExtractActualValueFromDefinition<TDefinition, THintType>>> &
    Extensions;

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
 * Crazy type that makes sure that if a value is defined with null, it gets the original type added to it
 * For example:
 * ```ts
 * class MyDto {
 *    prop1: number;
 *    prop2: string
 * }
 *
 * const formGroup = withResetFromSignal(MyDto, { prop1: 0, prop2: null });
 *
 * // formGroup.value.prop1 is number
 * // formGroup.value.prop2 is string | null - without this type, it would just be `null`
 * ```
 **/
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
