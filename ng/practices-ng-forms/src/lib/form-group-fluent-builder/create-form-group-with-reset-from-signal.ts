import { Injector, Signal } from '@angular/core';
import { PartialNullable } from '../utils/form.types';

import { createExtendedFormGroup, Extensions } from './extensions';
import { AllPropsAMustBeInB, FormControlsOfValues } from './form-group-types.internal';
import {
    DefinitionWithNullValuesInferredFromValue,
    ExtractActualValueFromDefinition,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupEnhancedWithSignals,
    FormGroupValueBase,
    TypedExtendedFormGroup,
    ValueSatisfyingType,
} from './types';
import { extendWithResetFromSignal, ResetWithSignalConfig } from './with-reset-from-signal';

/**
 * Crazy type that makes sure that the definition is compatible with the signal value,
 * so that the signal value can be used to reset the form group, meaning all properties in the form group must be present in the signal value.
 *
 *
 * TODO: The only drawback is, that suggested properties are not shown in the editor.
 */
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
 * The form group is enhanced with signals for all status properties and additional features accessible via fluent API (.with...()).
 *
 * Example:
 * ```ts
 * public readonly valueSignal = input.required<MyDto>({ alias: 'value' });
 * protected readonly myForm = formGroup.withResetFromSignal(this.valueSignal, {
 *   firstName: { nullable: true },
 *   lastName: { nullable: true },
 * });
 * ```
 * @param dtoSignal - The signal that provides the value to reset the form group to
 * @param definition - The definition of the form group
 * @param config - Configuration for the reset with signal
 */
export function createFormGroupWithResetFromSignal<
    TSignalValue extends FormGroupValueBase,
    TValue extends PartialNullable<TSignalValue>,
    TDefinition extends FormGroupDefinition<TValue>
>(
    dtoSignal: Signal<TSignalValue | null | undefined>,
    definition: DefinitionSatisfyingSignalValue<NoInfer<TSignalValue>, TDefinition>,
    config?: ResetWithSignalConfig<TSignalValue, TValue> & {
        injector?: Injector;
    }
): FormGroupEnhancedWithSignals<
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
> &
    Omit<Extensions, 'withResetFromSignal'> {
    const formGroup: TypedExtendedFormGroup<TDefinition> = createExtendedFormGroup(
        definition as unknown as TDefinition,
        config
    );

    return extendWithResetFromSignal.call(formGroup as any, dtoSignal, config as any) as any;
}

export function createTypedFormGroupWithResetFromSignalFactory<TValue extends FormGroupValueBase>() {
    return <TDefinition extends FormGroupDefinition<TValue>>(
        dtoSignal: Signal<TValue | null | undefined>,
        definition: DefinitionSatisfyingSignalValue<NoInfer<TValue>, TDefinition>,
        config?: ResetWithSignalConfig<TValue, TValue> & {
            injector?: Injector;
        }
    ) => createFormGroupWithResetFromSignal<TValue, TValue, TDefinition>(dtoSignal, definition, config);
}
