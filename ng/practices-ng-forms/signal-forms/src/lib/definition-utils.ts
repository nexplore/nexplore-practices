import { AnyDef, ArrayDef, ControlDef, GroupDef, isDef } from './definition';

/** The value a definition starts with. */
export function initialValueOfDef(def: AnyDef): any {
    switch (def.kind) {
        case 'control':
            return def.initialValue === undefined ? null : def.initialValue;
        case 'group':
            return Object.fromEntries(Object.entries(def.controls).map(([key, child]) => [key, initialValueOfDef(child as AnyDef)]));
        case 'array':
            return def.items.map((item: AnyDef) => initialValueOfDef(item));
    }
}

/**
 * The value `reset()` assigns for a definition when no explicit value is given:
 * the initial value for non-nullable controls, `null` for nullable ones.
 *
 * @param patch Explicit values (as passed to `reset(value)`); `undefined` entries fall back to the default.
 * @param template For arrays, the definition used for items that have no definition of their own.
 */
export function resetValueOfDef(def: AnyDef, patch: unknown, arrayItemDef?: (def: ArrayDef<any>) => AnyDef | undefined): any {
    switch (def.kind) {
        case 'control':
            return patch !== undefined ? patch : def.options.nonNullable ? def.initialValue ?? null : null;
        case 'group': {
            const patchRecord = (patch ?? {}) as Record<string, unknown>;
            return Object.fromEntries(
                Object.entries(def.controls).map(([key, child]) => [
                    key,
                    resetValueOfDef(child as AnyDef, patchRecord[key], arrayItemDef),
                ])
            );
        }
        case 'array': {
            const itemDef = arrayItemDef?.(def) ?? def.items[0];
            const source = Array.isArray(patch) ? patch : undefined;
            if (source) {
                return source.map((item, index) => {
                    const target = def.items[index] ?? itemDef;
                    return target ? resetValueOfDef(target, item, arrayItemDef) : item;
                });
            }
            return def.items.map((item: AnyDef) => resetValueOfDef(item, undefined, arrayItemDef));
        }
    }
}

const CONTROL_DEF_KEYS = ['value', 'disabled', 'updateOn', 'nullable'];

/**
 * Normalizes the entries of a definition record:
 * - definitions created with the builder are used as they are
 * - `{ value, nullable, validators, ... }` objects become control definitions
 * - anything else is the initial value of a non-nullable control
 */
export function normalizeDefinitionEntry(entry: unknown): AnyDef {
    if (isDef(entry)) {
        return entry;
    }
    if (typeof entry === 'object' && entry !== null && CONTROL_DEF_KEYS.some((key) => key in entry)) {
        const { value, nullable, ...rest } = entry as Record<string, any>;
        return new ControlDef(value, { ...rest, nonNullable: !nullable });
    }
    return new ControlDef(entry, { nonNullable: true });
}

export function normalizeDefinitionRecord(record: Record<string, unknown>): GroupDef<Record<string, AnyDef>> {
    return new GroupDef(Object.fromEntries(Object.entries(record).map(([key, entry]) => [key, normalizeDefinitionEntry(entry)])));
}
