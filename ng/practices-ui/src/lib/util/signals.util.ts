import { Signal, isSignal } from '@angular/core';

/**
 * @deprecated
 * 
 * Returns the first signal value which is not null.
 *
 * Makes sure that all signal values are read once, so that they are all tracked
 *
 * TODO: This is a utility for a common signals problem that might or might not be resolved by angular in the future (maybe they will have their own util function?). Keep an eye on this.
 */
export function getSignalsFirstValue<T>(...signals: Array<Signal<T> | T>): T {
    const signalValues = signals.map((s) => (isSignal(s) ? s() : s));
    return signalValues.find((v) => v !== undefined && v !== null)!;
}
