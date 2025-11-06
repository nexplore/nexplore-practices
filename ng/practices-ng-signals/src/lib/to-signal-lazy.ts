import { assertInInjectionContext, DestroyRef, inject, Signal, untracked } from '@angular/core';
import { toSignal, ToSignalOptions } from '@angular/core/rxjs-interop';
import { connectable, Observable, Subscription } from 'rxjs';

export function toSignalLazy<T>(
    source: Observable<T>,
    options?: ToSignalOptions<T> & {
        initialValue: T;
    }
): Signal<T>;
export function toSignalLazy<T>(
    source: Observable<T>,
    options?: ToSignalOptions<T> & {
        requireSync: true;
    }
): Signal<T>;
export function toSignalLazy<T>(source: Observable<T>, options?: ToSignalOptions<T>): Signal<T | undefined>;

/**
 * Converts an observable to a signal that is lazily connected, meaning it will only subscribe to the source observable when the signal is first read.
 *
 * @param source The source observable
 * @returns A signal that is lazily connected to the source observable
 */
export function toSignalLazy<T>(source: Observable<T>, options?: ToSignalOptions<T>): Signal<T | undefined> {
    assertInInjectionContext(toSignalLazy);
    const conn = connectable(source);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signal = toSignal(conn, options as any); // Any cast to simplify the type handling because of overloads.
    let currentSubscription: Subscription | undefined;

    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
        if (currentSubscription) {
            currentSubscription.unsubscribe();
            currentSubscription = undefined;
        }
    });

    return new Proxy(signal, {
        apply: (target) => {
            if (!currentSubscription) {
                // If the signal is being read for the first time, connect to the observable.
                // Note: The `untracked` function is used to avoid triggering change detection, in case the subscription-handler contains hidden signal reads.
                untracked(() => {
                    currentSubscription = conn.connect();
                });
            }

            return target();
        },
    });
}
