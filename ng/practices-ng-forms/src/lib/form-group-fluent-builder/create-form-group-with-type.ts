import { Injector, Type } from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import { PartialNullable } from '../utils/form.types';
import { createTypedFactory } from './create-form-group';
import { createTypedFormGroupWithResetFromSignalFactory } from './create-form-group-with-reset-from-signal';

import { createExtendedFormGroup, Extensions } from './extensions';
import { AllPropsAMustBeInB, FormControlsOfValues } from './form-group-types.internal';
import {
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupEnhancedWithSignals,
    FormGroupValueBase,
    ValueSatisfying,
} from './types';

/**
 * Crazy type that makes sure that the definition is compatible with the provided type.
 *
 * TODO: The only drawback is, that suggested properties are not shown in the editor.
 */
type DefinitionSatisfyingType<
    TFOrmGroupValue extends FormGroupValueBase,
    TDefinition
> = TDefinition extends FormGroupDefinition<infer TValue>
    ? TDefinition extends FormGroupDefinition<AllPropsAMustBeInB<TValue, TFOrmGroupValue>>
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
 * Creates a form group whose form controls have to satisfy the properties of the given type.
 *
 * The form group is enhanced with signals for all status properties and additional features accessible via fluent API (.with...()).
 *
 * All controls defined must be present in the type, but the type can have additional properties.
 *
 * The type of the properties must match, but the form group may have null or undefined values.
 *
 * Example:
 * ```ts
 * class MyDto {
 *   name: string;
 *   age: number;
 *   email?: string;
 * }
 *
 * ...
 * const myForm = formGroup.withType(MyDto, { name: {nullable: true}, age: {nullable: false} });
 *```
 *
 * @param typeToSatisfy The type that the form group's controls must satisfy.
 * @param initialValueOrDefinition The initial value or definition of the form group.
 * @param config Optional configuration.
 */
export function createFormGroupWithType<
    TSatisfy extends FormGroupValueBase,
    TValueOrDef extends PartialNullable<TSatisfy> | FormGroupDefinitionRecord<PartialNullable<TSatisfy>>
>(
    typeToSatisfy: Type<TSatisfy>,
    initialValueOrDefinition: DefinitionSatisfyingType<NoInfer<TSatisfy>, TValueOrDef>,
    config?: {
        injector?: Injector;
    }
): FormGroupEnhancedWithSignals<FormControlsOfValues<ValueSatisfying<TValueOrDef, TSatisfy>>> & Extensions;

export function createFormGroupWithType<
    TSatisfy extends FormGroupValueBase,
    TValueOrDef extends PartialNullable<TSatisfy> | FormGroupDefinitionRecord<PartialNullable<TSatisfy>>
>(
    typeToSatisfy?: Type<TSatisfy>,
    initialValueOrDefinition?: DefinitionSatisfyingType<NoInfer<TSatisfy>, TValueOrDef>,
    config?: {
        injector?: Injector;
    }
):
    | TypedFormGroupFactoryFluentApi<TSatisfy>
    | (FormGroupEnhancedWithSignals<FormControlsOfValues<ValueSatisfying<TValueOrDef, TSatisfy>>> & Extensions) {
    trace('withType', { typeToSatisfy, initialValueOrDefinition, config });
    if (!typeToSatisfy) {
        return {
            withConfig: createTypedFactory(),
            withResetFromSignal: createTypedFormGroupWithResetFromSignalFactory(),
        };
    }

    return createExtendedFormGroup(initialValueOrDefinition!, config) as any;
}
