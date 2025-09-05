import { isObservable, Observable } from 'rxjs';

/**
 * Checks if a value is a Promise or an Observable.
 *
 * @param value The value to check.
 * @returns `true` if the value is a Promise or an Observable, `false` otherwise.
 */
export function isAsyncOrObservable<T>(value: T | Promise<T> | Observable<T>): value is Promise<T> | Observable<T> {
    return value instanceof Promise || isObservable(value);
}
