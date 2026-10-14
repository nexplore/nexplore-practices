import { SignalFormControl } from '@angular/forms/signals/compat';
import type { FormOptions, SchemaFn } from '@angular/forms/signals';

/**
 * Creates a Signal Forms-backed Reactive Forms control.
 *
 * The returned control can be used anywhere Angular accepts an AbstractControl,
 * including a FormGroup or FormArray.
 */
export function createSignalFormControl<T>(value: T): SignalFormControl<T>;
export function createSignalFormControl<T>(value: T, options: FormOptions<T>): SignalFormControl<T>;
export function createSignalFormControl<T>(
    value: T,
    schema: SchemaFn<T>,
    options?: FormOptions<T>
): SignalFormControl<T>;
export function createSignalFormControl<T>(
    value: T,
    schemaOrOptions?: SchemaFn<T> | FormOptions<T>,
    options?: FormOptions<T>
): SignalFormControl<T> {
    return new SignalFormControl(value, schemaOrOptions, options);
}

export { SignalFormControl, compatForm } from '@angular/forms/signals/compat';
export { disabled, form, required, submit } from '@angular/forms/signals';
