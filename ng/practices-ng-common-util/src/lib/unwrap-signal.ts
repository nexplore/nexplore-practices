import { isSignal } from '@angular/core';
import { ValueOrSignal } from './types';

/**
 * Extracts the value from a signal or returns the value directly if it's not a signal.
 *
 * @param valueOrSignal A value or a signal.
 * @returns The unwrapped value.
 */
export function unwrapSignal<T>(valueOrSignal: ValueOrSignal<T>): T {
    return isSignal(valueOrSignal) ? (valueOrSignal() as T) : valueOrSignal;
}
