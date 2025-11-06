import { effect, EffectRef, inject, Injector, runInInjectionContext } from '@angular/core';
import { trace } from '@nexplore/practices-ng-logging';
import { Subscription } from 'rxjs';

/**
 * Passes through the provided source object and allows applying the provided effects to it.
 *
 * This function is purely for purpose of organizing effects in a more readable way, there is no real logic behind it.
 *
 * Example:
 * ```ts
 * readonly myValueSignal = withEffects(
 *     signal(1),
 *     effect(() => {
 *        const myValue = this.myValueSignal();
 *        // Do something with myValue
 *     })
 * );
 * ```
 *
 * In some cases, when the value depends on type-inference, you might need to use a factory function to create the effects:
 * ```ts
 * readonly myTableViewSource = withEffects(
 *    tableViewSource.withConfig(....),
 *    myTableViewSource => {  // Sometimes, when the type is not inferred correctly, you need to use a factory function as here
 *      effect(() => {
 *        const pageData = myTableViewSource.pageDataSignal();
 *        // Do something
 *      });
 *    });
 * ```
 *
 *
 * @param source Any object that should be passed through.
 * @param effects A list of effects or functions that should be applied to the source object.
 * @returns The unaltered source object.
 */
export function withEffects<TSource>(
    source: TSource,
    ...effects: NoInfer<Array<EffectRef | ((v: TSource) => void)>>
): TSource {
    const injector = inject(Injector);
    setTimeout(() => {
        // Timeout so that self-referencing still works, E.g `const form = withEffects(new FormGroup..., () => form.controls....)`
        runInInjectionContext(injector, () =>
            effects.forEach((f) => {
                if (typeof f === 'function') {
                    f(source);
                }
            })
        );
    });
    return source;
}

/**
 * Creates an effect that subscribes to the provided subscription.
 *
 * Whenever the effect is re-run, the previous subscription is unsubscribed.
 *
 * When the effect lifetime ends, the subscription is unsubscribed.
 *
 * Example 1, the most simple case, where the subscriptin gets unsubscribed when the containing injector (component / service) gets destroyed:
 * ```ts
 * subscriptionEffect(() => {
 *    return myObservable.subscribe((value) => {
 *    // Do something with the value
 *    });
 * });
 * ```
 *
 * Example 2, where the subscription gets renewed based on the change of a signal value:
 * ```ts
 * const mySignal = signal(0);
 *
 * subscriptionEffect(() => {
 *   const value = mySignal(); // Whenever the signal changes, the effect is re-run, thus the old subscription is unsubscribed and a new one is created
 *   return myObservable(value).subscribe((value) => {
 *   // Do something with the value
 *   });
 * });
 * ```
 */
export function subscriptionEffect(effectFn: () => Subscription | undefined | void): EffectRef {
    let currentSubscription: undefined | Subscription;

    return effect((onCleanup) => {
        trace('subscriptionEffect', 'running effect', {
            effectFn,
            currentSubscription,
        });
        currentSubscription?.unsubscribe();
        currentSubscription = effectFn() as Subscription;

        onCleanup(() => currentSubscription?.unsubscribe());
    });
}
