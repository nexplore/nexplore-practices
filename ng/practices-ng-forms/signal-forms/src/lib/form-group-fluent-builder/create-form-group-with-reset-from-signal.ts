import type { Injector, Signal } from '@angular/core';
import type { SignalFormGroup } from '../nodes/nodes';
import type {
    AllPropsAMustBeInB,
    DefinitionWithNullValuesInferredFromValue,
    ExtractActualValueFromDefinition,
    FormControlsOfValues,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupValueBase,
    PartialNullable,
    TypedExtendedFormGroup,
    ValueSatisfyingType,
} from '../types';
import { createExtendedFormGroup } from './extensions';
import { extendWithResetFromSignal, ResetWithSignalConfig } from './with-reset-from-signal';

/** Makes sure that all properties of the definition are present in the signal value. */
type DefinitionSatisfyingSignalValue<
    TSignalValue extends FormGroupValueBase,
    TDefinition
> = TDefinition extends FormGroupDefinition<infer TValue>
    ? TDefinition extends FormGroupDefinition<AllPropsAMustBeInB<TValue, TSignalValue>>
        ? TDefinition
        : never
    : never;

/**
 * Creates a form group that resets its value whenever the provided signal emits a new value.
 *
 * ```ts
 * public readonly valueSignal = input.required<MyDto>({ alias: 'value' });
 * protected readonly myForm = formGroup.withResetFromSignal(this.valueSignal, {
 *   firstName: { nullable: true },
 *   lastName: { nullable: true },
 * });
 * ```
 */
export function createFormGroupWithResetFromSignal<
    TSignalValue extends FormGroupValueBase,
    TValue extends PartialNullable<TSignalValue>,
    TDefinition extends FormGroupDefinition<TValue>
>(
    dtoSignal: Signal<TSignalValue | null | undefined>,
    definition: DefinitionSatisfyingSignalValue<NoInfer<TSignalValue>, TDefinition>,
    config?: ResetWithSignalConfig<TSignalValue, TValue> & { injector?: Injector }
): SignalFormGroup<
    FormControlsOfValues<
        TDefinition extends FormGroupDefinitionRecord<any>
            ? ExtractActualValueFromDefinition<
                  DefinitionWithNullValuesInferredFromValue<TDefinition, TSignalValue>,
                  TSignalValue
              >
            : TDefinition extends PartialNullable<TSignalValue>
            ? ValueSatisfyingType<TSignalValue, TDefinition>
            : never
    >
> {
    const formGroup: TypedExtendedFormGroup<TDefinition> = createExtendedFormGroup(
        definition as unknown as TDefinition,
        config
    );

    return extendWithResetFromSignal.call(formGroup as any, dtoSignal as any, config as any) as any;
}

export function createTypedFormGroupWithResetFromSignalFactory<TValue extends FormGroupValueBase>() {
    return <TDefinition extends FormGroupDefinition<TValue>>(
        dtoSignal: Signal<TValue | null | undefined>,
        definition: DefinitionSatisfyingSignalValue<NoInfer<TValue>, TDefinition>,
        config?: ResetWithSignalConfig<TValue, TValue> & { injector?: Injector }
    ) => createFormGroupWithResetFromSignal<TValue, TValue, TDefinition>(dtoSignal, definition, config);
}
