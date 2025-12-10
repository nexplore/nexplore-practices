import { inject, Injector, signal, Signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { formValueSignalsDependencyTracker } from './form-value-signals-dependency-tracker';
import { FormGroupValues, FormValueSignalsRecord } from './form.types';

/**
 * @internal - Do not use directly, used for other api functions.
 *
 * Creates a proxy for the values of a form group that allows to access the current value of the form control
 *
 * For each property accessed, a signal is created that will update whenever the value of the form control changes.
 *
 * IF a form control is a form group itself, a new proxy is created for the form group, thus recursively creating signals for all nested form controls.
 */
export function createFormValueSignalsProxyWithAutoTrackingDependencies<
    TForm extends FormGroup,
    TFormValue extends FormGroupValues<TForm>
>(
    form: TForm,
    options?: {
        /**
         * Injector to use for creating signals.
         *
         * The lifecycle of the signals will be bound to the injector.
         *
         * If not provided, the current injector will be used (Requires injection context).
         */
        injector?: Injector;

        /**
         * Time to debounce the signals, so that they get emitted together
         */
        debounceTime?: number;

        /**
         * Filter function that can be used to filter out values that should not be emitted.
         */
        filter?: (control: AbstractControl) => boolean;

        /**
         * Handler that is called whenever a new dependency is tracked
         */
        onTrackDependencyHandler?: (key: string, control: AbstractControl, signal: Signal<any>) => void;
    },
    $$state?: {
        debounceSourceSubject?: BehaviorSubject<number | undefined>;
    }
): TFormValue & FormValueSignalsRecord<TFormValue> {
    const injector = options?.injector ?? inject(Injector);

    // Will track the dependencies of the form controls as signals
    const dependencyTracker = formValueSignalsDependencyTracker(form, {
        ...options,
        debounceSourceSubject: $$state?.debounceSourceSubject,
    });

    // If the form group contains child form groups, we will recursively create proxies for them
    const childFormGroupValueProxiesRecord: Record<
        string,
        Signal<TFormValue & FormValueSignalsRecord<TFormValue>>
    > = {};

    return new Proxy<TFormValue & FormValueSignalsRecord<TFormValue>>(form.value as any, {
        get(_target, prop: keyof TFormValue extends string ? keyof TFormValue : never) {
            // Fields can be accessed either directly or via a signal, for example, a form group like `new FormGroup({ field1: new FormControl("hi") })`, can be accessed as `form.value.field1` or `form.value.field1Signal`
            const asksForSignalReference = prop.endsWith('Signal');

            // Check if the property is a (nested) form group
            if (form.controls[prop] instanceof FormGroup) {
                // Check if we already have a cached proxy signal
                if (!childFormGroupValueProxiesRecord[prop as string]) {
                    // Recursively create a proxy for the child form group
                    childFormGroupValueProxiesRecord[prop as string] = signal(
                        createFormValueSignalsProxyWithAutoTrackingDependencies(
                            form.controls[prop],
                            { ...options, injector },
                            { debounceSourceSubject: dependencyTracker.debounceSourceSubject }
                        )
                    );
                }

                const proxySignal = childFormGroupValueProxiesRecord[prop as string];

                if (asksForSignalReference) {
                    return proxySignal;
                } else {
                    return proxySignal();
                }
            } else {
                // Check if we already have a cached signal for the control
                if (!dependencyTracker.hasSignal(prop)) {
                    // Use the dependency tracker to create a signal for the control
                    dependencyTracker.getOrCreateSignalForControl(prop as any);
                }

                if (asksForSignalReference) {
                    return dependencyTracker.getSignal(prop);
                } else {
                    // Evaluate the signal to track the dependency
                    dependencyTracker.evaluateSignal(prop);

                    // Return the actual value of the control (So it is guaranteed to be up to date)
                    return form.controls[prop].value;
                }
            }
        },
        // This is called implicitly by the consumer when it wants to know the keys of the object, like `Object.keys()`, or even a for loop.
        ownKeys(): ArrayLike<string | symbol> {
            const keyChangesSignal = dependencyTracker.getOrCreateSignalForControlsAddedOrRemoved();

            // The consumer needs to be signaled when the keys change (e.g. a control got added)
            return keyChangesSignal();
        },
        has(target: TFormValue & FormValueSignalsRecord<TFormValue>, p: string | symbol): boolean {
            return Reflect.has(form.value, p);
        },
        getOwnPropertyDescriptor(
            target: TFormValue & FormValueSignalsRecord<TFormValue>,
            p: string | symbol
        ): PropertyDescriptor | undefined {
            return Reflect.getOwnPropertyDescriptor(form.value, p);
        },
    });
}
