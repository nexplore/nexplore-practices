import { DestroyRef, effect, inject, Provider, Signal, Type } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
    pipe,
    takeUntil,
} from 'rxjs';
import { combineDirectiveControlErrors } from '../utils/combine-directive-control-errors';
import { cloneDtoWith } from '../utils/dto-nswag-utils';
import { INswagGeneratedType } from '../utils/form.types';

export interface WrapperFormControlAccessor<T = any> {
    /**
     * The formGroup or control that will be used to read and write values as well as to validate the form control.
     */
    getValueAccessorWrapperFormControl(): AbstractControl<T> | undefined;

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
     * If implemented, this method should validate the form control.
     */
    validate?(_control: AbstractControl): ValidationErrors | null;

    /**
     * If implemented, this method should return the instance of the current DTO.
     *
     * It will then be used to assign the value to the formGroup and pass it to the outer form control.
     */
    getValueAccessorEntityDto?(): INswagGeneratedType | null;

    /**
     * If implemented, this method should return the signal of the current DTO.
     *
     * It will then be used to assign the value to the formGroup, whenever the signal emits a new value.
     */
    getValueAccessorEntityDtoSignal?(): Signal<INswagGeneratedType | null>;

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

    return [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useFactory: (): ControlValueAccessor => {
                const instance = inject(component);
                const destroyRef = inject(DestroyRef);

                trace('WrapperFormControlAccessor', 'NG_VALUE_ACCESSOR', { instance });

                function writeEntityToForm(obj: any): void {
                    if (instance.writeValue) {
                        instance.writeValue(obj);
                    } else {
                        const control = instance.getValueAccessorWrapperFormControl();
                        if (control) {
                            instance.getValueAccessorWrapperFormControl()?.reset(obj);
                        }
                    }
                }

                if (instance.getValueAccessorEntityDtoSignal) {
                    const signal = instance.getValueAccessorEntityDtoSignal();
                    let isInitial = true;
                    effect(() => {
                        const dto = signal();
                        if (isInitial && (dto === null || dto === undefined)) {
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
                    writeValue(obj: any) {
                        trace(
                            'WrapperFormControlAccessor',
                            'writeValue',
                            instance,
                            obj,
                            instance.getValueAccessorWrapperFormControl()
                        );
                        writeEntityToForm(obj);
                    },
                    registerOnChange(fn: any) {
                        const formControl = instance.getValueAccessorWrapperFormControl();

                        (
                            instance.valueAccessorWrapperFormValueChange$ ??
                            formControl?.valueChanges.pipe(filter(() => formControl.dirty)) ??
                            EMPTY
                        )
                            .pipe(debounceTime(1), safeTakeUntilDestroyed(destroyRef))
                            .subscribe((value) => {
                                trace('WrapperFormControlAccessor', 'on value change', instance, {
                                    value,
                                    isDirty: formControl?.dirty,
                                });
                                if (instance.getValueAccessorEntityDto || instance.getValueAccessorEntityDtoSignal) {
                                    const entity =
                                        instance.getValueAccessorEntityDto?.() ??
                                        instance.getValueAccessorEntityDtoSignal?.()();
                                    if (entity) {
                                        value = cloneDtoWith(entity, value);
                                        trace('WrapperFormControlAccessor', 'new value', { value });
                                    } else {
                                        trace('WrapperFormControlAccessor', 'Entity is not available', {
                                            instance,
                                            entity,
                                            value,
                                        });
                                    }
                                }
                                fn(value);
                            });
                    },
                    registerOnTouched(fn: any) {
                        const formControl = instance.getValueAccessorWrapperFormControl();
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
                            instance.getValueAccessorWrapperFormControl()?.disable();
                        } else {
                            instance.getValueAccessorWrapperFormControl()?.enable();
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

                const isValidChange$ = instance.valueAccessorWrapperFormStateChange$
                    ? instance.valueAccessorWrapperFormStateChange$.pipe(
                          map((state) => state.valid),
                          distinctUntilChanged()
                      )
                    : defer(
                          () =>
                              instance.getValueAccessorWrapperFormControl()?.statusChanges.pipe(
                                  debounceTime(1),
                                  distinctUntilChanged(),
                                  map((status) => status === 'VALID'),
                                  safeTakeUntilDestroyed(destroyRef)
                              ) ?? EMPTY
                      );

                const isValidSignal = toSignal(isValidChange$);

                return {
                    validate(control: AbstractControl): ValidationErrors | null {
                        if (instance.validate) {
                            return instance.validate(control);
                        }

                        const isValid = isValidSignal();

                        const form = instance.getValueAccessorWrapperFormControl();

                        if (isValid || !form) {
                            return null;
                        }

                        const errors = combineDirectiveControlErrors(form);

                        trace('WrapperFormControlAccessor', 'validate', instance, {
                            isValid,
                            errors,
                            form,
                        });

                        return errors;
                    },
                    registerOnValidatorChange(fn: () => void) {
                        isValidChange$.subscribe(fn);
                    },
                };
            },
        },
    ];
}
