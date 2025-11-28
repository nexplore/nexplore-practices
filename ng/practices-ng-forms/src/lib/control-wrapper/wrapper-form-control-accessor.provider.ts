import { DestroyRef, effect, inject, isSignal, Provider, Signal, Type, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    TouchedChangeEvent,
    ValidationErrors,
    Validator,
} from '@angular/forms';
import { trace } from '@nexplore/practices-ng-logging';
import {
    catchError,
    debounceTime,
    defaultIfEmpty,
    defer,
    distinctUntilChanged,
    EMPTY,
    filter,
    map,
    MonoTypeOperatorFunction,
    NEVER,
    Observable,
    of,
    pipe,
    switchMap,
    takeUntil,
} from 'rxjs';
import { combineDirectiveControlErrors } from '../utils/combine-directive-control-errors';
import { cloneDtoWith, isDto } from '../utils/dto-nswag-utils';
import { INswagGeneratedType, TypedPartialFormGroup } from '../utils/form.types';

export interface WrapperFormControlAccessor<T = any> {
    /**
     * The formGroup or control that will be used to read and write values as well as to validate the form control.
     */
    getValueAccessorWrapperFormControl():
        | AbstractControl<T>
        | TypedPartialFormGroup<T>
        | Signal<AbstractControl<T> | TypedPartialFormGroup<T> | undefined>
        | undefined;

    /**
     * If implemented, this observable will be used to listen for value changes and callback the form control accessor.
     *
     * By default, the value changes are listened to using `formGroup.valueChanges`.
     */
    valueAccessorWrapperFormValueChange$?: Observable<any>;

    /**
     * If implemented, the state of this observable will be used by the NG_VALIDATORS provider.
     *
     * By default, the form state is read from the provided form control or form group.
     */
    valueAccessorWrapperFormStateChange$?: Observable<{ valid: boolean }>;

    /**
     * If implemented, this method should write the value to the formGroup.
     *
     * By default, the value is written to the formGroup using `formGroup.reset(value)`.
     */
    writeValue?(value: any): void;

    /**
     * If implemented, this method should return the validation errors of the form control.
     */
    validate?(control: AbstractControl): ValidationErrors | null;

    /**
     * If implemented, this method should return the instance of the current DTO.
     *
     * It will then be used to assign the value to the formGroup and pass it to the outer form control.
     */
    getValueAccessorEntityDto?(): INswagGeneratedType | null;

    /**
     * @deprecated Use `getValueAccessorEntityDtoSignalToAutoResetForm` instead.
     *
     * If implemented, this method should return the signal of the current DTO.
     *
     * It will then be used to assign the value to the formGroup, whenever the signal emits a new value.
     */
    getValueAccessorEntityDtoSignal?(): Signal<INswagGeneratedType | null>;

    /**
     * If implemented, this method should return the signal of the current DTO.
     *
     * It will then be used to assign the value to the formGroup, whenever the signal emits a new value.
     */
    getValueAccessorEntityDtoSignalToAutoResetForm?(): Signal<INswagGeneratedType | null | undefined>;

    /**
     * If implemented, this method will be called when the form control is disabled or enabled.
     */
    setDisabledState?(isDisabled: boolean): void;
}

/**
 * Provides the necessary accessors for the form control to interact with the component.
 *
 * This is a abstraction combining `NG_VALUE_ACCESSOR` and `NG_VALIDATORS` providers.
 *
 * There are multiple methods that can be implemented to customize the behavior of the form control.
 *
 * At the minimum, the `getValueAccessorWrapperFormControl` method should be implemented to return the form control or form group that will be used to read and write values as well as to validate the form control.
 *
 * If you intend to use the form control with values that are DTO constructors, you should implement either the `getValueAccessorEntityDto` or `getValueAccessorEntityDtoSignal` methods to provide the current DTO.
 */
export function provideWrappedFormControlAccessors(component: Type<WrapperFormControlAccessor>): Provider[] {
    // https://github.com/angular/angular/issues/54527
    function safeTakeUntilDestroyed<T>(destroyRef?: DestroyRef): MonoTypeOperatorFunction<T> {
        return pipe(
            takeUntil(
                NEVER.pipe(
                    takeUntilDestroyed(destroyRef),
                    catchError(() => EMPTY),
                    defaultIfEmpty(null)
                )
            )
        );
    }
    function getValueAccessorWrapperFormControl(
        instance: WrapperFormControlAccessor
    ): AbstractControl<any, any> | TypedPartialFormGroup<any> | undefined {
        const formControl = instance.getValueAccessorWrapperFormControl();
        if (isSignal(formControl)) {
            return formControl();
        }
        return formControl;
    }

    return [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useFactory: (): ControlValueAccessor => {
                const instance = inject(component);
                const destroyRef = inject(DestroyRef);

                // TODO: Remove when `getValueAccessorEntityDtoSignal` is migrated
                if (
                    instance.getValueAccessorEntityDtoSignal &&
                    !instance.getValueAccessorEntityDtoSignalToAutoResetForm
                ) {
                    console.warn(
                        '`getValueAccessorEntityDtoSignal` is deprecated. Please use `getValueAccessorEntityDtoSignalToAutoResetForm` instead.',
                        instance
                    );

                    instance.getValueAccessorEntityDtoSignalToAutoResetForm = instance.getValueAccessorEntityDtoSignal;
                }

                // This variable will hold the actual instance of the value that was written to the form control.
                // We need to hold it separately, because the form control might be a `FormGroup` or `FormControl` that does not have a direct reference to the DTO.
                // We need to be able to access the DTO in the `registerOnChange` method, so we can make sure that, in case of a DTO, the value is cloned and merged with the DTO before passing it to the change emitter.
                // It can be overridden by implementing the `getValueAccessorEntityDto` or `getValueAccessorEntityDtoSignalToAutoResetForm` methods.
                let currentDtoValue: any | null = null;

                trace('WrapperFormControlAccessor', 'NG_VALUE_ACCESSOR', { instance });

                function writeEntityToForm(obj: any): void {
                    currentDtoValue = obj;
                    if (instance.writeValue) {
                        trace('WrapperFormControlAccessor', 'calling (custom) method');
                        instance.writeValue(obj);
                    } else {
                        const control = instance.getValueAccessorWrapperFormControl();
                        if (control) {
                            trace('WrapperFormControlAccessor', 'calling reset on form control');
                            getValueAccessorWrapperFormControl(instance)?.reset(obj);
                        }
                    }
                }

                if (instance.getValueAccessorEntityDtoSignalToAutoResetForm) {
                    const signal = instance.getValueAccessorEntityDtoSignalToAutoResetForm();
                    let isInitial = true;
                    effect(() => {
                        const dto = signal();
                        if (isInitial && (dto === undefined || dto === null)) {
                            // initially, we do not want to write the value if the dto is not available (The form might already have a initial value)
                            return;
                        } else {
                            isInitial = false;
                            trace('WrapperFormControlAccessor', 'writeValue from dto signal', instance, dto);
                            writeEntityToForm(dto);
                        }
                    });
                }

                return {
                    writeValue(value: any) {
                        const form = getValueAccessorWrapperFormControl(instance);
                        trace('WrapperFormControlAccessor', 'writeValue', instance, {
                            value,
                            form,
                            formStatus: form?.status,
                            dirty: form?.dirty,
                        });
                        writeEntityToForm(value);
                    },
                    registerOnChange(fn: any) {
                        const formControl = getValueAccessorWrapperFormControl(instance);

                        (
                            instance.valueAccessorWrapperFormValueChange$ ??
                            formControl?.valueChanges.pipe(
                                debounceTime(1),
                                filter(() => formControl.dirty)
                            ) ??
                            EMPTY
                        )
                            .pipe(safeTakeUntilDestroyed(destroyRef))
                            .subscribe((value) => {
                                untracked(() => {
                                    trace('WrapperFormControlAccessor', 'on value change', instance, {
                                        value,
                                        copyOfValueAtTime: { ...value },
                                        isDirty: formControl?.dirty,
                                    });
                                    if (
                                        (instance.getValueAccessorEntityDto ||
                                            instance.getValueAccessorEntityDtoSignalToAutoResetForm ||
                                            currentDtoValue) &&
                                        !isDto(value)
                                    ) {
                                        const entity =
                                            instance.getValueAccessorEntityDto?.() ??
                                            instance.getValueAccessorEntityDtoSignalToAutoResetForm?.()() ??
                                            isDto(currentDtoValue)
                                                ? currentDtoValue
                                                : null;

                                        if (entity && value !== null) {
                                            value = cloneDtoWith(entity, value);
                                            trace('WrapperFormControlAccessor', 'new value', { value });
                                        } else {
                                            trace(
                                                'WrapperFormControlAccessor',
                                                'Entity is not available or value is null',
                                                {
                                                    instance,
                                                    entity,
                                                    value,
                                                }
                                            );
                                        }
                                    }
                                    fn(value);
                                });
                            });
                    },
                    registerOnTouched(fn: any) {
                        const formControl = getValueAccessorWrapperFormControl(instance);
                        if (!formControl) {
                            return;
                        }

                        formControl.events
                            .pipe(
                                filter((ev) => ev instanceof TouchedChangeEvent && ev.touched),
                                safeTakeUntilDestroyed(destroyRef)
                            )
                            .subscribe(() => {
                                trace('WrapperFormControlAccessor', 'on touched', instance);
                                fn();
                            });
                    },
                    setDisabledState(isDisabled: boolean) {
                        trace('WrapperFormControlAccessor', 'setDisabledState', instance, isDisabled);
                        if (instance.setDisabledState) {
                            instance.setDisabledState(isDisabled);
                        } else if (isDisabled) {
                            getValueAccessorWrapperFormControl(instance)?.disable();
                        } else {
                            getValueAccessorWrapperFormControl(instance)?.enable();
                        }
                    },
                };
            },
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useFactory: (): Validator => {
                const instance = inject(component);
                const destroyRef = inject(DestroyRef);

                const wrapperControl = instance.getValueAccessorWrapperFormControl();
                const wrapperControl$ = isSignal(wrapperControl) ? toObservable(wrapperControl) : of(wrapperControl);

                const isValidChange$ = instance.valueAccessorWrapperFormStateChange$
                    ? instance.valueAccessorWrapperFormStateChange$.pipe(
                          map((state) => state.valid),
                          distinctUntilChanged()
                      )
                    : defer(
                          () =>
                              wrapperControl$.pipe(
                                  switchMap((ctrl) => ctrl?.statusChanges ?? EMPTY),
                                  debounceTime(1),
                                  distinctUntilChanged(),
                                  map((status) => status === 'VALID'),
                                  safeTakeUntilDestroyed(destroyRef)
                              ) ?? EMPTY
                      );

                const isValidSignal = toSignal(isValidChange$);

                return {
                    validate(_control: AbstractControl): ValidationErrors | null {
                        return untracked(() => {
                            if (instance.validate) {
                                return instance.validate(_control);
                            }

                            const isValid = isValidSignal();

                            const form = getValueAccessorWrapperFormControl(instance);

                            if (isValid || !form) {
                                return null;
                            }

                            const combinedErrors = combineDirectiveControlErrors(form);
                            trace(
                                'WrapperFormControlAccessor',
                                'validate',
                                instance,
                                instance.getValueAccessorWrapperFormControl(),
                                combinedErrors
                            );

                            return combinedErrors;
                        });
                    },
                    registerOnValidatorChange(fn: () => void) {
                        isValidChange$.subscribe(fn);
                    },
                };
            },
        },
    ];
}
