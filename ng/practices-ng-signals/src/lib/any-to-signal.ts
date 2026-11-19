import type { Signal } from '@angular/core';
import { assertInInjectionContext, computed, isSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { isObservable } from 'rxjs';
import type { SignalOrObservable } from './types';

/**
 * Converts any signal or observable to a signal.
 *
 * @param source A signal, observable or static value
 * @param options Options for the conversion
 */
export function anyToSignal<T, TDefault = undefined>(
    source: SignalOrObservable<T>,
    options?: { defaultValue?: TDefault }
): Signal<T | TDefault> {
    assertInInjectionContext(anyToSignal);
    return isSignal(source)
        ? source
        : isObservable(source)
          ? toSignal(source as Observable<T>, { initialValue: options?.defaultValue as any })
          : computed(() => source as T);
}
