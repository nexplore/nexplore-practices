import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ValidationErrors, Validators } from '@angular/forms';
import { createExtendedFormGroup } from './extensions';

describe('Reactive Forms compatibility contract', () => {
    it('preserves disabled control value aggregation', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({
                name: 'John Doe',
                internalId: { value: 'id-1', disabled: true },
            });

            const results = [
                formGroup.value,
                formGroup.getRawValue(),
            ];

            formGroup.controls.internalId.enable();
            results.push(formGroup.value);

            formGroup.controls.name.disable();
            results.push(formGroup.value);

            expect(results).toEqual([
                { name: 'John Doe' },
                { name: 'John Doe', internalId: 'id-1' },
                { name: 'John Doe', internalId: 'id-1' },
                { internalId: 'id-1' },
            ]);
        });
    });

    it('preserves disabled control value aggregation for factory definitions', () => {
        TestBed.runInInjectionContext(() => {
            const disabled = signal(true);
            const formGroup = createExtendedFormGroup(() => ({
                name: { value: 'John Doe' },
                internalId: { value: 'id-1', disabled: disabled() },
            }));

            TestBed.flushEffects();
            const results = [formGroup.value, formGroup.getRawValue()];

            disabled.set(false);
            TestBed.flushEffects();
            results.push(formGroup.value);

            disabled.set(true);
            TestBed.flushEffects();
            results.push(formGroup.value);

            expect(results).toEqual([
                { name: 'John Doe' },
                { name: 'John Doe', internalId: 'id-1' },
                { name: 'John Doe', internalId: 'id-1' },
                { name: 'John Doe' },
            ]);
        });
    });

    it('preserves an omitted control value when a factory changes updateOn', () => {
        TestBed.runInInjectionContext(() => {
            const updateOn = signal<'change' | 'blur'>('change');
            const formGroup = createExtendedFormGroup(() => ({
                name: { value: 'initial', updateOn: updateOn() },
            }));

            TestBed.flushEffects();
            formGroup.controls.name.setValue('edited');
            updateOn.set('blur');
            TestBed.flushEffects();

            expect(formGroup.controls.name.value).toBe('edited');
            expect(formGroup.controls.name.updateOn).toBe('blur');
        });
    });

    it('preserves ValidationErrors round-tripping through the control API', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({
                name: { value: '', validators: [Validators.required] },
            });
            const errors: Array<ValidationErrors | null> = [formGroup.controls.name.errors];

            formGroup.controls.name.setValue('John Doe');
            errors.push(formGroup.controls.name.errors);

            formGroup.controls.name.setErrors({ serverRejected: true });
            errors.push(formGroup.controls.name.errors);

            formGroup.controls.name.setErrors(null);
            errors.push(formGroup.controls.name.errors);

            expect(errors).toEqual([{ required: true }, null, { serverRejected: true }, null]);
        });
    });
});
