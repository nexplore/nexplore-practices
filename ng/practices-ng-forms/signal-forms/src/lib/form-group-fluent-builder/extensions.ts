import { effect, inject, Injector, runInInjectionContext, untracked } from '@angular/core';
import { isObjDeepEqual } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { AnyDef, ControlDef, GroupDef, SignalFormBuilder } from '../definition';
import { initialValueOfDef, normalizeDefinitionEntry, normalizeDefinitionRecord } from '../definition-utils';
import type { AnyNode } from '../nodes/nodes';
import { SignalFormRuntime } from '../runtime/form-runtime';
import type { FormGroupDefinition, FormGroupValueBase, TypedExtendedFormGroup } from '../types';

/**
 * Applies a re-evaluated definition (definition functions that read signals) to an existing form:
 * - new keys become new controls
 * - existing controls get the new value (if it differs) and disabled state
 * - keys that are no longer defined are reset and disabled
 */
function updateDefinition(runtime: SignalFormRuntime, record: Record<string, unknown>): void {
    const root = runtime.rootNode;
    const rootDef = runtime.defAt([]) as GroupDef<Record<string, AnyDef>>;
    const entries = Object.entries(record).map(([key, entry]) => [key, normalizeDefinitionEntry(entry)] as const);

    for (const [key, def] of entries) {
        const existing = (root.controls as Record<string, AnyNode>)[key];
        if (!existing) {
            rootDef.controls[key] = def;
            runtime.registerAddedControl('', key, def);
            runtime.model.update((model) => ({ ...model, [key]: initialValueOfDef(def) }));
            root.ensureControl(key, def);
            continue;
        }

        if (def instanceof ControlDef) {
            const hasValue = def.initialValue !== undefined;
            const value = hasValue ? def.initialValue : existing.rawValue;
            if (!isObjDeepEqual(existing.rawValue, value)) {
                existing.reset(value);
            }
            if (existing.disabled !== def.options.disabled) {
                if (def.options.disabled) {
                    existing.disable();
                } else {
                    existing.enable();
                }
            }
        }
    }

    const defined = new Set(entries.map(([key]) => key));
    for (const [key, control] of Object.entries(root.controls) as [string, AnyNode][]) {
        if (!defined.has(key)) {
            control.reset(undefined);
            control.disable();
        }
    }
}

/**
 * @internal
 * Creates a signal form group from a definition (plain value record, record of control definitions, or a function
 * that returns one and receives a `SignalFormBuilder`).
 *
 * The returned group is a facade over a signal form tree: it owns no state itself.
 */
export function createExtendedFormGroup<TDefinition extends FormGroupDefinition<FormGroupValueBase>>(
    definition: TDefinition,
    config?: { injector?: Injector }
): TypedExtendedFormGroup<TDefinition> {
    const injector = config?.injector ?? inject(Injector);
    const builder = new SignalFormBuilder();

    let rootDef: GroupDef<Record<string, AnyDef>>;

    if (typeof definition === 'function') {
        try {
            rootDef = normalizeDefinitionRecord((definition as Function)(builder));
        } catch (e) {
            trace(
                'createExtendedFormGroup',
                'Error when calling initial definition, this might happen when reading signals and should not be a problem.',
                e
            );
            rootDef = normalizeDefinitionRecord({});
        }
    } else {
        rootDef = normalizeDefinitionRecord(definition as Record<string, unknown>);
    }

    const runtime = runInInjectionContext(injector, () => new SignalFormRuntime(injector, rootDef));

    if (typeof definition === 'function') {
        runInInjectionContext(injector, () => {
            effect(() => {
                const record = (definition as Function)(builder) as Record<string, unknown>;
                // Idempotent for an unchanged definition, so the first run needs no special treatment.
                untracked(() => updateDefinition(runtime, record));
            });
        });
    }

    return runtime.rootNode as unknown as TypedExtendedFormGroup<TDefinition>;
}
