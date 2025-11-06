import { isSignal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlState, FormGroup, UntypedFormGroup } from '@angular/forms';
import { ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { debounceTime, distinctUntilChanged, filter, map, noop, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { FormGroupValues, TypedFormGroup } from './form.types';
import { ElementsOfArray } from './types-internal';

/**
 * Creates a signal that emits the value changes of a form group. Only emits if the form group is dirty.
 *
 * Duplicate values are filtered out.
 *
 * Note: If you want the signal to always hold the current value of the form group, use `formGroupCurrentValueSignal` instead.
 */
export function formGroupValueChangesSignal<TValue = any>(
    formGroup: TypedFormGroup<TValue> | UntypedFormGroup | Signal<TypedFormGroup<TValue>> | Signal<UntypedFormGroup>,
    options: { initialValue: TValue | null | {} } = { initialValue: {} }
): Signal<Partial<TValue>> {
    const formGroup$ = isSignal(formGroup) ? toObservable(formGroup) : of(formGroup);
    return toSignal(
        formGroup$.pipe(
            switchMap((formGroup) =>
                (formGroup.valueChanges as Observable<any>).pipe(
                    filter((_) => formGroup.dirty),
                    distinctUntilChanged(),
                    debounceTime(1)
                )
            )
        ),
        { initialValue: options.initialValue as any }
    ) as Signal<Partial<TValue>>;
}

/**
 * Creates a signal that emits the current value of a form group.
 *
 * Allows to define the control names to only emit the values of the specified controls.
 *
 * Duplicate values are filtered out.
 *
 * TODO: Check if all this configurability is really usefull, now that we have utils like `formGroupSignalRecord`, might also be a matter of taste.
 */
export function formGroupCurrentValueMappedSignal<
    TValue,
    TFormGroup extends TypedFormGroup<TValue>,
    TControlNames extends Array<keyof TValue>,
    TInput extends Pick<TValue, ElementsOfArray<TControlNames>>,
    TResult = Pick<TValue, ElementsOfArray<TControlNames>>
>(
    formGroup: ValueOrSignal<TFormGroup>,
    options?: {
        initialValue?: TValue | null | {};
        debounceTime?: number;
        controlNames?: TControlNames;

        filter?: (values: TInput) => boolean;
        map?: (values: TInput) => TResult;
        distinctComparator?: NoInfer<(previous: TInput, current: TInput) => boolean>;
    }
): Signal<TResult> {
    const formGroup$ = isSignal(formGroup) ? toObservable(formGroup) : of(formGroup);
    return toSignal(
        formGroup$.pipe(
            switchMap((formGroup) =>
                (formGroup.valueChanges as Observable<any>).pipe(
                    startWith(formGroup.value),
                    map((value) => {
                        if (options?.controlNames && value) {
                            return options.controlNames.reduce((acc, key) => {
                                acc[key] = value[key];
                                return acc;
                            }, {} as any);
                        } else {
                            return value;
                        }
                    }),
                    distinctUntilChanged(
                        options?.distinctComparator ??
                            ((a, b) => {
                                if (!a || !b) {
                                    return a === b;
                                }

                                const aEntries = Object.entries(a);
                                const bEntries = Object.entries(b);
                                return (
                                    aEntries.length === bEntries.length &&
                                    aEntries.every(([key, value]) => value === b[key])
                                );
                            })
                    ),
                    debounceTime(options?.debounceTime ?? 1),
                    filter(options?.filter ?? (() => true)),
                    map(options?.map ?? ((v) => v as unknown as TResult))
                )
            )
        ),
        {
            initialValue:
                options?.initialValue === undefined
                    ? options?.map
                        ? (undefined as TResult)
                        : ({} as TResult)
                    : (options.initialValue as TResult),
        }
    ) as Signal<TResult>;
}

/**
 * Creates a signal that emits the current value of a form group.
 *
 * Duplicate values are filtered out.
 */
export function formGroupCurrentValueSignal<
    TValue extends FormGroupValues<TFormGroup>,
    TFormGroup extends FormGroup = TypedFormGroup<TValue>
>(
    formGroup: ValueOrSignal<TFormGroup>,
    options?: {
        initialValue?: TValue | null | {};
        debounceTime?: number;
        distinctComparator?: NoInfer<(previous: TValue, current: TValue) => boolean>;
    }
): Signal<TValue> {
    return formGroupCurrentValueMappedSignal(formGroup, options) as Signal<TValue>;
}

/**
 * Creates a signal that emits the current value of a form control.
 *
 * Duplicate values are filtered out.
 *
 * @param formControl The form control to listen to.
 * @param options The options to configure the signal.
 * - `distinctComparator` The comparator function to use to compare the previous and current value. Default is a deep comparison.
 * - `debounceTime` The time in milliseconds to debounce the value changes. Default is 1. If set to -1, the signal will not debounce amd be emitted immediately.
 */
export function formControlCurrentValueSignal<T>(
    formControl: ValueOrSignal<AbstractControl<T | null>>,
    options?: { distinctComparator?: (previous: T, current: T) => boolean; debounceTime?: number }
): Signal<Exclude<T, FormControlState<any>> | null> {
    return toSignal(
        (isSignal(formControl) ? toObservable(formControl) : of(formControl)).pipe(
            filter((e) => !!e?.valueChanges),
            switchMap((e) => (e.valueChanges as Observable<T>).pipe(startWith(e.value!))),
            distinctUntilChanged(options?.distinctComparator),
            options?.debounceTime === -1 ? tap(noop) : debounceTime(options?.debounceTime ?? 1)
        ),
        {
            initialValue: (isSignal(formControl)
                ? null // Signal might not yet be initialized if it is a required input (https://angular.dev/errors/NG0950/)
                : formControl?.value ?? null) as T,
        }
    ) as Signal<Exclude<T, FormControlState<any>> | null>;
}
