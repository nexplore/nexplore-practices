import { inject, Injector, runInInjectionContext, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup } from '@angular/forms';
import { isArrayEqual } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import {
    BehaviorSubject,
    debounce,
    distinctUntilChanged,
    filter,
    map,
    MonoTypeOperatorFunction,
    noop,
    of,
    startWith,
    switchMap,
    tap,
    timer,
} from 'rxjs';
import { FormGroupValues } from './form.types';

type TrackedFormControlValueSignal<T = any> = Signal<T>;

export type FormValueSignalsDependencyTracker<TFormValue> = {
    /**
     * Creates a signal observing the value and changes of a form control.
     *
     * If one for the provided control name was already created, returns the existing signal.
     */
    getOrCreateSignalForControl<TKey extends keyof TFormValue & string>(
        controlName: TKey
    ): TrackedFormControlValueSignal<TFormValue[TKey]>;

    /**
     * Creates a signal observing the keys of the form group value change.
     *
     * If the signal was already created, returns the existing signal.
     */
    getOrCreateSignalForControlsAddedOrRemoved(): Signal<ArrayLike<string | symbol>>;

    /**
     * Checks if a signal for the provided control name was already created.
     */
    hasSignal(controlName: string): boolean;

    /**
     * Evaluates the signal for the provided control name, if it was already created.
     */
    evaluateSignal<TKey extends keyof TFormValue & string>(controlName: TKey): void;

    /**
     * Returns the signal for the provided control name.
     *
     * If the signal was not created yet, returns undefined.
     */
    getSignal<TKey extends keyof TFormValue & string>(
        controlName: TKey
    ): TrackedFormControlValueSignal<TFormValue[TKey]> | undefined;

    /**
     * The actual used debounce source subject.
     *
     * Returns the same subject that was passed in the options, or a new one if not provided.
     */
    readonly debounceSourceSubject: BehaviorSubject<number | undefined>;
};

/**
 * Creates a stateful wrapper for a form group, providing an api to lazily create signals for each control value.
 *
 * The signals are created on demand, and are cached for future use.
 *
 * Optionally, the signals can be debounced, so that multiple form value changes get emitted together after a specified debounce-time.
 */
export function formValueSignalsDependencyTracker<TForm extends FormGroup, TFormValue extends FormGroupValues<TForm>>(
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
         * Use when multiple dependency trackers are used together, to debounce the signals together
         */
        debounceSourceSubject?: BehaviorSubject<number | undefined>;

        /**
         * Filter function that can be used to filter out values that should not be emitted.
         */
        filter?: (control: AbstractControl) => boolean;

        /**
         * Handler that is called whenever a new dependency is tracked
         */
        onTrackDependencyHandler?: (key: string, control: AbstractControl, signal: Signal<any>) => void;
    }
): FormValueSignalsDependencyTracker<TFormValue> {
    const injector = options?.injector ?? inject(Injector);

    // If debounce option is set, will debounce the resulting signals, so that they get emitted together
    const debounceSourceSubject =
        options?.debounceSourceSubject ?? new BehaviorSubject<number | undefined>(options?.debounceTime);
    const debounce$ = debounceSourceSubject.pipe(
        // Don't emit until silence of specified time
        switchMap((time) => (time ? timer(time) : of(0))),
        tap((_) => trace('createFormSignalProxy', 'debounce timer completed'))
    );

    // A record containing a signal for each property that is read
    const cache: Record<keyof TFormValue, TrackedFormControlValueSignal> = {} as any;
    let keysSignal: Signal<string[]>;

    trace('createFormSignalProxy', { form, options });

    function debounceIfConfigured<T>(filterFn?: (v: any) => boolean): MonoTypeOperatorFunction<T> {
        return options?.debounceTime
            ? debounce((value) => {
                  debounceSourceSubject.next(options.debounceTime!);
                  trace('createFormSignalProxy', 'value', { value }, 'debouncing...');

                  return debounce$.pipe(
                      map(() => value),
                      filterFn ? filter(filterFn) : tap(noop)
                  );
              })
            : tap(noop);
    }

    return {
        getOrCreateSignalForControl<TKey extends keyof TFormValue & string>(
            controlName: TKey
        ): TrackedFormControlValueSignal<TFormValue[TKey]> {
            const isSignalCreated = !!cache[controlName];
            if (!isSignalCreated && form.controls[controlName]) {
                const observable = form.controls[controlName].valueChanges.pipe(
                    startWith(form.controls[controlName].value),
                    distinctUntilChanged(),
                    debounceIfConfigured((_) => (options?.filter ? options.filter(form.controls[controlName]) : true))
                );
                const valueSignal = untracked(() => runInInjectionContext(injector, () => toSignal(observable)));

                cache[controlName] = valueSignal;

                trace('createFormSignalProxy', 'create signal proxy', controlName, 'formControl', {
                    formControl: form.controls[controlName],
                    form,
                });

                options?.onTrackDependencyHandler?.(controlName as string, form.controls[controlName], valueSignal);
            } else {
                trace('createFormSignalProxy', 'get', controlName, 'fallback', {
                    form,
                    signalRecord: cache,
                });
            }

            return cache[controlName]; // Return the signal object itself
        },
        hasSignal(controlName: string): boolean {
            return controlName in cache;
        },
        evaluateSignal<TKey extends keyof TFormValue & string>(controlName: TKey): void {
            if (controlName in cache) {
                cache[controlName]();
            }
        },
        getSignal<TKey extends keyof TFormValue & string>(
            controlName: TKey
        ): TrackedFormControlValueSignal<TFormValue[TKey]> {
            return cache[controlName];
        },
        getOrCreateSignalForControlsAddedOrRemoved(): Signal<ArrayLike<string | symbol>> {
            if (!keysSignal) {
                const observable = form.valueChanges.pipe(
                    map((_) => Object.keys(form.value)),
                    distinctUntilChanged((a, b) => isArrayEqual(a, b)),
                    tap((keys) => trace('createFormSignalProxy', 'keys changed', { form, keys })),
                    debounceIfConfigured()
                );

                keysSignal = untracked(() =>
                    runInInjectionContext(injector, () =>
                        toSignal(observable, { initialValue: Object.keys(form.value) })
                    )
                );
            }

            return keysSignal;
        },
        debounceSourceSubject,
    };
}
