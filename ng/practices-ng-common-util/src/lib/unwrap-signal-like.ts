import { isSignal } from '@angular/core';
import { ValueOrGetter } from './types';

/**
 * Extracts the value from a signal-like object, function, or returns the value directly if it's not a function or signal.
 *
 * @param valueOrGetter A value, a signal, or a function that returns a value.
 * @returns The unwrapped value.
 */
export function unwrapSignalLike<T>(valueOrGetter: ValueOrGetter<T>): T {
    return typeof valueOrGetter === 'function'
        ? (valueOrGetter as () => T)()
        : isSignal(valueOrGetter)
            ? (valueOrGetter() as T)
            : valueOrGetter;
}
