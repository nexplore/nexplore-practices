import type { Signal } from '@angular/core';
import { isDto } from '../utils/dto-nswag-utils';
import type { INswagGeneratedType } from '../utils/form.types';

/**
 * Returns the DTO to clone the form value with: the DTO provided by the component, or else the last written value if it
 * is a DTO.
 *
 * Internal: kept in its own file so that the package index does not export it.
 */
export function resolveValueAccessorEntityDto(
    instance: {
        getValueAccessorEntityDto?(): INswagGeneratedType | null;
        getValueAccessorEntityDtoSignalToAutoResetForm?(): Signal<INswagGeneratedType | null | undefined>;
    },
    currentDtoValue: unknown
): INswagGeneratedType | null {
    return (
        instance.getValueAccessorEntityDto?.() ??
        instance.getValueAccessorEntityDtoSignalToAutoResetForm?.()() ??
        (isDto(currentDtoValue) ? (currentDtoValue as INswagGeneratedType) : null)
    );
}
