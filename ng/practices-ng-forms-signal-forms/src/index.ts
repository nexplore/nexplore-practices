import { SignalFormControl } from '@angular/forms/signals/compat';

type SignalFormControlConstructorParameters = ConstructorParameters<typeof SignalFormControl>;

/**
 * Creates a Signal Forms-backed Reactive Forms control.
 *
 * The returned control can be used anywhere Angular accepts an AbstractControl,
 * including a FormGroup or FormArray.
 */
export function createSignalFormControl<T>(
    value: T,
    schemaOrOptions?: SignalFormControlConstructorParameters[1],
    options?: SignalFormControlConstructorParameters[2]
): SignalFormControl<T> {
    return new SignalFormControl(value, schemaOrOptions, options) as SignalFormControl<T>;
}

export { SignalFormControl, compatForm } from '@angular/forms/signals/compat';
export { disabled, form, required, submit } from '@angular/forms/signals';
