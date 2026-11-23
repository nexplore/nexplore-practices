import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 * Reads a property of the `NgSelectComponent`.
 *
 * Since ng-select 24, most of its inputs are signals (`input()` / `model()`), earlier versions use plain properties.
 * This helper returns the current value for both.
 */
export function readNgSelectProp<T = any>(ngSelect: NgSelectComponent, prop: string): T {
    const value = (ngSelect as any)[prop];
    return typeof value === 'function' ? value() : value;
}

/**
 * Writes a property of the `NgSelectComponent`.
 *
 * Handles writable signals (`model()`), read-only input signals and plain properties.
 */
export function writeNgSelectProp(ngSelect: NgSelectComponent, prop: string, value: any): void {
    const current = (ngSelect as any)[prop];
    if (current != null && typeof current.set === 'function') {
        current.set(value);
        return;
    }

    // `input()` signals are read-only. Setting them from the outside relies on Angular signal internals
    if (typeof current === 'function' && current[SIGNAL] != null) {
        signalSetFn(current[SIGNAL], value);
        return;
    }

    (ngSelect as any)[prop] = value;
}
