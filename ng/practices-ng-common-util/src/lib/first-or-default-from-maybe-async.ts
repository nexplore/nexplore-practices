import { trace } from '@nexplore/practices-ng-logging';
import { isObservable, Observable } from 'rxjs';

/**
 * Returns a promise that resolves with the first value emitted by the observable,
 * the resolved value of the promise, or the value itself if it's neither an observable nor a promise.
 * If the observable completes without emitting any value, the default value is returned.
 *
 * @param observableOrValueOrPromise An observable, promise, or direct value.
 * @param defaultValue The default value to return if the observable completes without emitting.
 * @returns A promise that resolves with the value or default value.
 */
export function firstOrDefaultFromMaybeAsync<T, TDefault = T>(
    observableOrValueOrPromise: Promise<T> | T | Observable<T>,
    defaultValue: TDefault
): Promise<T | TDefault> {
    if (observableOrValueOrPromise instanceof Promise) {
        return observableOrValueOrPromise;
    } else if (isObservable(observableOrValueOrPromise)) {
        return new Promise<T | TDefault>((resolve, reject) => {
            let result: T | TDefault = defaultValue;
            observableOrValueOrPromise.subscribe({
                next: (value) => {
                    resolve(value);
                    result = value;
                },
                error: (error) => {
                    reject(error);
                },
                complete: () => {
                    resolve(result);
                },
            });
        }).then((v) => {
            trace('firstOrDefaultFromMaybeAsync', { v });
            return v;
        });
    } else {
        return Promise.resolve(observableOrValueOrPromise);
    }
}
