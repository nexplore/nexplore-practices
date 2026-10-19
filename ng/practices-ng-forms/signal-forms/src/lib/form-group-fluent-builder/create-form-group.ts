import type { Injector } from '@angular/core';
import type {
    BuildFromGroupValueFn,
    FormGroupDefinition,
    FormGroupDefinitionRecord,
    FormGroupValueBase,
    PartialNullable,
    TypedExtendedFormGroup,
} from '../types';
import { createExtendedFormGroup } from './extensions';

/**
 * Creates a signal form group from a definition.
 *
 * It accepts two kinds of syntax:
 *
 * - A short syntax centered around the data structure:
 * ```typescript
 * protected readonly myForm = formGroup.withBuilder(() => ({
 *    name: { value: 'John Doe', nullable: true },
 * }));
 * ```
 *
 * - Alternatively, a function that receives a builder with the same call shapes as Angular's `FormBuilder`:
 * ```typescript
 * protected readonly myForm = formGroup.withBuilder(({ control, group, array }) => ({
 *   name: control('John Doe'),
 *   address: group({ street: control('123 Main St') }),
 *   tags: array(['a', 'b']),
 * }));
 * ```
 *
 * @param definition The definition (record or function)
 * @param config Optional configuration
 */
export function createFormGroup<TDefinition extends FormGroupDefinition<FormGroupValueBase>>(
    definition: TDefinition,
    config?: { injector?: Injector }
): TypedExtendedFormGroup<TDefinition> {
    return createExtendedFormGroup(definition, config);
}

export function createTypedFactory<TValue extends FormGroupValueBase>() {
    return <TDefinition extends BuildFromGroupValueFn<TValue> | FormGroupDefinitionRecord<PartialNullable<TValue>>>(
        definition: TDefinition,
        config?: { injector?: Injector }
    ): TypedExtendedFormGroup<TDefinition, TValue> => createFormGroup<TDefinition>(definition, config);
}
