import { from, isObservable, Observable, of } from 'rxjs';

/**
 * Converts a value, promise, or observable to an observable.
 *
 * @param value A value, promise, or observable.
 * @returns An observable that emits the value.
 */
export function maybeAsyncToObservable<T>(value: Promise<T> | T | Observable<T>): Observable<T> {
    return isObservable(value) ? value : value instanceof Promise ? from(value) : of(value);
}
