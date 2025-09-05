import { Injector } from '@angular/core';
import { PartialNullable } from "../utils/form.types";

import { createExtendedFormGroup } from './extensions';
import {
    BuildFromGroupValueFn,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupValueBase,
    TypedExtendedFormGroup
} from './types';

/**
 * Creates a form group from a builder function.
 *
 * The form group is enhanced with signals for all status properties and additional features accessible via fluent API (.with...()).
 *
 * It accepts two type of syntaxes:
 *
 * - A short syntax centered around the data structure:
 * ```typescript
 * protected readonly myForm = formGroup.withBuilder(() => ({
 *    name: { value: 'John Doe', nullable: true },
 * }));
 * ```
 *
 * - Alternatively, for more customized forms, the function is passed a FormBuilder instance:
 * ```typescript
 * protected readonly myForm = formGroup.withBuilder(({control, group}) => ({
 *   name: control('John Doe'),
 *   address: group({
 *     street: control('123 Main St'),
 *   }),
 * }));
 * ```
 *
 * @param definition The builder function
 * @param config Optional configuration
 */
export function createFormGroup<TDefinition extends FormGroupDefinition<FormGroupValueBase>>(
    definition: TDefinition,
    config?: {
        injector?: Injector;
    }
): TypedExtendedFormGroup<TDefinition> {
    return createExtendedFormGroup(definition, config);
}

export function createTypedFactory<TValue extends FormGroupValueBase>() {
    return <
        TDefinition extends BuildFromGroupValueFn<TValue> | FormGroupDefinitionRecord<PartialNullable<TValue>>
    >(
        definition: TDefinition,
        config?: {
            injector?: Injector;
        }): TypedExtendedFormGroup<TDefinition, TValue> =>
        createFormGroup<TDefinition>(definition, config);
}
