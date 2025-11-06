import { isSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isObservable, Observable, of } from 'rxjs';
import { SignalOrObservable } from './types';

/**
 * Converts any signal or observable to an observable.
 *
 * @param source A signal, observable or static value
 * @returns An observable
 */
export function anyToObservable<T>(source: SignalOrObservable<T>): Observable<T> {
    return isSignal(source) ? toObservable(source) : isObservable(source) ? source : of(source);
}
