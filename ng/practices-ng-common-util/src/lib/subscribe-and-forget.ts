import { Observable } from 'rxjs';

/**
 * Subscribes to an observable and forgets about it. This is useful when you want to subscribe to an observable but you don't care about the result.
 *
 * Make sure you handle lifecycle of the observable in another way, e.g. by using `takeUntilDestroyed`.
 * 
 * @param observable The observable to subscribe to.
 */
export function subscribeAndForget(observable: Observable<unknown>): void {
    // eslint-disable-next-line rxjs/no-ignored-subscription
    observable.subscribe();
}
