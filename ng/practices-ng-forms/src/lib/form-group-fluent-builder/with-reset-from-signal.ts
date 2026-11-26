import type { Signal } from '@angular/core';
import { effect, runInInjectionContext, untracked } from '@angular/core';
import type { FormGroupEnhancedWithSignals } from './types';
import type { FormControlValue, FormGroupValues } from '../utils/form.types';
/**
 * Configuration for the reset with signal
 * @param mapValue - Maps the signal value to the form group value
 */
export type ResetWithSignalConfig<TDto, TFormGroupValues> = {
    mapValue?: (dto: TDto) => TFormGroupValues;
};

/**
 * Extends the form with an effect, that resets its value whenever the provided signal emits a new value.
 *
 * Example:
 * ```ts
 * public readonly valueSignal = input.required<MyDto>({ alias: 'value' });
 * protected readonly myForm = formGroup.withBuilder(...).withResetFromSignal(this.valueSignal);
 * ```
 * @param dtoSignal - The signal that provides the value to reset the form group to
 * @param config - Configuration for the reset with signal
 */
export function extendWithResetFromSignal<
    TFormGroup extends FormGroupEnhancedWithSignals,
    TSignalValue extends Required<FormControlValue<TFormGroup>>,
>(
    this: TFormGroup,
    dtoSignal: Signal<TSignalValue | null | undefined>,
    config?: ResetWithSignalConfig<TSignalValue, FormGroupValues<TFormGroup>>
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        effect(() => {
            const value = dtoSignal();

            // Only the DTO signal triggers a reset. Signals read by mapValue, validators or value change
            // subscribers must not become dependencies, or a change of them would discard the user's edits.
            untracked(() => {
                let dto: any = value;
                if (config?.mapValue) {
                    dto = config.mapValue(dto);
                }

                this.reset(dto);
            });
        });
    });

    return this;
}
