import { signal } from '@angular/core';
import type { INswagGeneratedType } from '../utils/form.types';
import { resolveValueAccessorEntityDto } from './resolve-value-accessor-entity-dto';

class PersonDto implements INswagGeneratedType {
    name?: string;
    init(data?: any) {
        this.name = data?.name;
    }
    toJSON() {
        return { name: this.name };
    }
}

function dto(name: string) {
    const value = new PersonDto();
    value.init({ name });
    return value;
}

describe('resolveValueAccessorEntityDto', () => {
    it('uses the DTO provided by getValueAccessorEntityDto, even if no DTO was written yet', () => {
        const provided = dto('provided');

        expect(resolveValueAccessorEntityDto({ getValueAccessorEntityDto: () => provided }, null)).toBe(provided);
    });

    it('prefers the DTO provided by the component over the last written value', () => {
        const provided = dto('provided');

        expect(resolveValueAccessorEntityDto({ getValueAccessorEntityDto: () => provided }, dto('written'))).toBe(
            provided
        );
    });

    it('uses the DTO of getValueAccessorEntityDtoSignalToAutoResetForm', () => {
        const provided = dto('signal');

        expect(
            resolveValueAccessorEntityDto(
                { getValueAccessorEntityDtoSignalToAutoResetForm: () => signal(provided) },
                null
            )
        ).toBe(provided);
    });

    it('falls back to the last written value if it is a DTO', () => {
        const written = dto('written');

        expect(resolveValueAccessorEntityDto({ getValueAccessorEntityDto: () => null }, written)).toBe(written);
    });

    it('returns null if neither the component nor the last written value provide a DTO', () => {
        expect(resolveValueAccessorEntityDto({}, { name: 'plain object' })).toBeNull();
        expect(resolveValueAccessorEntityDto({}, null)).toBeNull();
    });
});
