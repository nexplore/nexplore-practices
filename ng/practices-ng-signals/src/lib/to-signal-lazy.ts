import { assertInInjectionContext, DestroyRef, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { connectable, Observable, Subscription } from 'rxjs';

/**
 * Converts an observable to a signal that is lazily connected, meaning it will only subscribe to the source observable when the signal is first read.
 * @param source The source observable
 * @returns A signal that is lazily connected to the source observable
 */
export function toSignalLazy<T>(source: Observable<T>): Signal<T | undefined> {
    assertInInjectionContext(toSignalLazy);
    const conn = connectable(source);
    const signal = toSignal(conn);
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
                currentSubscription = conn.connect();
            }

            return target();
        },
    });
}
