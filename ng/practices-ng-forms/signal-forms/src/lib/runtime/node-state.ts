import { signal, WritableSignal } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';
import { createManagedMetadataKey } from '@angular/forms/signals';

/**
 * Per-field imperative state that Reactive Forms exposes as methods (`disable()`, `setErrors()`, ...).
 * It is stored as managed metadata on the field, so it lives and dies with the field node itself
 * (for array items the state follows the item, not the index).
 */
export interface NodeState {
    /** `undefined` means "use the definition", `true`/`false` force the state. */
    readonly disabled: WritableSignal<boolean | undefined>;
    readonly readonly: WritableSignal<boolean | undefined>;
    readonly hidden: WritableSignal<boolean | undefined>;
    /** Errors set manually via `setErrors()`, together with the value they were set for. */
    readonly manualErrors: WritableSignal<{ errors: ValidationErrors; forValue: unknown } | null>;
}

export const NODE_STATE = createManagedMetadataKey<NodeState, true>(() => ({
    disabled: signal<boolean | undefined>(undefined),
    readonly: signal<boolean | undefined>(undefined),
    hidden: signal<boolean | undefined>(undefined),
    manualErrors: signal<{ errors: ValidationErrors; forValue: unknown } | null>(null),
}));
