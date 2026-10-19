import type { Injector, Type } from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import type { SignalFormGroup } from '../nodes/nodes';
import type {
    AllPropsAMustBeInB,
    FormControlsOfValues,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupValueBase,
    PartialNullable,
    ValueSatisfying,
} from '../types';
import { createTypedFactory } from './create-form-group';
import { createTypedFormGroupWithResetFromSignalFactory } from './create-form-group-with-reset-from-signal';
import { createExtendedFormGroup } from './extensions';

/** Makes sure that the definition is compatible with the provided type. */
type DefinitionSatisfyingType<
    TFormGroupValue extends FormGroupValueBase,
    TDefinition
> = TDefinition extends FormGroupDefinition<infer TValue>
    ? TDefinition extends FormGroupDefinition<AllPropsAMustBeInB<TValue, TFormGroupValue>>
        ? TDefinition
        : never
    : never;

type TypedFormGroupFactoryFluentApi<T extends FormGroupValueBase> = {
    withConfig: ReturnType<typeof createTypedFactory<T>>;
    withResetFromSignal: ReturnType<typeof createTypedFormGroupWithResetFromSignalFactory<T>>;
};

/**
 * Creates a fluent form group builder whose value must satisfy the specified generic type parameter
 */
export function createFormGroupWithType<T extends FormGroupValueBase>(): TypedFormGroupFactoryFluentApi<T>;

/**
 * Creates a form group whose controls have to satisfy the properties of the given type.
 *
 * All controls defined must be present in the type, but the type can have additional properties.
 * The type of the properties must match, but the form group may have null or undefined values.
 *
 * ```ts
 * const myForm = formGroup.withType(MyDto, { name: { nullable: true }, age: { nullable: false } });
 * ```
 */
export function createFormGroupWithType<
    TSatisfy extends FormGroupValueBase,
    TValueOrDef extends PartialNullable<TSatisfy> | FormGroupDefinitionRecord<PartialNullable<TSatisfy>>
>(
    typeToSatisfy: Type<TSatisfy>,
    initialValueOrDefinition: DefinitionSatisfyingType<NoInfer<TSatisfy>, TValueOrDef>,
    config?: { injector?: Injector }
): SignalFormGroup<FormControlsOfValues<ValueSatisfying<TValueOrDef, TSatisfy>>>;

export function createFormGroupWithType<
    TSatisfy extends FormGroupValueBase,
    TValueOrDef extends PartialNullable<TSatisfy> | FormGroupDefinitionRecord<PartialNullable<TSatisfy>>
>(
    typeToSatisfy?: Type<TSatisfy>,
    initialValueOrDefinition?: DefinitionSatisfyingType<NoInfer<TSatisfy>, TValueOrDef>,
    config?: { injector?: Injector }
):
    | TypedFormGroupFactoryFluentApi<TSatisfy>
    | SignalFormGroup<FormControlsOfValues<ValueSatisfying<TValueOrDef, TSatisfy>>> {
    trace('withType', { typeToSatisfy, initialValueOrDefinition, config });
    if (!typeToSatisfy) {
        return {
            withConfig: createTypedFactory(),
            withResetFromSignal: createTypedFormGroupWithResetFromSignalFactory(),
        };
    }

    return createExtendedFormGroup(initialValueOrDefinition as any, config) as any;
}
