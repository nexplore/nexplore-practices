import { effect, runInInjectionContext, Signal, untracked } from '@angular/core';
import type { SignalFormGroup } from '../nodes/nodes';
import type { GroupValues } from '../types';

/**
 * Configuration for the reset with signal.
 * @param mapValue - Maps the signal value to the form group value
 */
export type ResetWithSignalConfig<TDto, TFormGroupValues> = {
    mapValue?: (dto: TDto) => TFormGroupValues;
};

/**
 * Resets the form whenever the provided signal emits a new value.
 *
 * ```ts
 * protected readonly myForm = formGroup.withBuilder(...).withResetFromSignal(this.valueSignal);
 * ```
 */
export function extendWithResetFromSignal<TFormGroup extends SignalFormGroup<any>, TSignalValue extends object>(
    this: TFormGroup,
    dtoSignal: Signal<TSignalValue | null | undefined>,
    config?: ResetWithSignalConfig<TSignalValue, GroupValues<TFormGroup>>
): TFormGroup {
    runInInjectionContext(this.injector, () => {
        effect(() => {
            let dto: any = dtoSignal();
            if (config?.mapValue) {
                dto = config.mapValue(dto);
            }
            untracked(() => this.reset(dto));
        });
    });
    return this;
}
