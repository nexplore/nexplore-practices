import { firstValueFrom, isObservable, Observable } from 'rxjs';

/**
 * Returns a promise that resolves with the first value emitted by the observable,
 * the resolved value of the promise, or the value itself if it's neither an observable nor a promise.
 *
 * @param observableOrValueOrPromise An observable, promise, or direct value.
 * @returns A promise that resolves with the value.
 */
export function firstValueFromMaybeAsync<T>(observableOrValueOrPromise: Promise<T> | T | Observable<T>): Promise<T> {
    if (observableOrValueOrPromise instanceof Promise) {
        return observableOrValueOrPromise;
    } else if (isObservable(observableOrValueOrPromise)) {
        return firstValueFrom(observableOrValueOrPromise);
    } else {
        return Promise.resolve(observableOrValueOrPromise);
    }
}
