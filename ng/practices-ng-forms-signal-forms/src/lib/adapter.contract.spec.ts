import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { compatForm, createSignalFormControl, disabled, form, required, SignalFormControl, submit } from '../index';

describe('Signal Forms compatibility exports', () => {
    it('bridges a Signal Form control into a Reactive Form group', () => {
        TestBed.runInInjectionContext(() => {
            const name = createSignalFormControl('', (path) => required(path));
            const reactive = new FormGroup({ name });

            expect(name).toBeInstanceOf(SignalFormControl);
            expect(name.value).toBe('');
            expect(name.valid).toBe(false);
            expect(name.fieldTree().errors().length).toBeGreaterThan(0);
            expect(reactive.invalid).toBe(true);

            name.setValue('Ada');

            expect(name.value).toBe('Ada');
            expect(name.valid).toBe(true);
            expect(name.fieldTree().errors()).toEqual([]);
            expect(reactive.value).toEqual({ name: 'Ada' });
        });
    });

    it('preserves disabled and raw-value semantics at the Reactive Forms boundary', () => {
        TestBed.runInInjectionContext(() => {
            const name = createSignalFormControl('Ada', (path) => disabled(path));
            const reactive = new FormGroup({ name, legacy: new FormControl('legacy') });

            expect(name.disabled).toBe(true);
            expect(reactive.value).toEqual({ legacy: 'legacy' });
            expect(reactive.getRawValue()).toEqual({ name: 'Ada', legacy: 'legacy' });
        });
    });

    it('supports the official compatForm model shape', () => {
        const legacy = new FormControl('Ada');
        const model = signal({ name: legacy });
        const fields = TestBed.runInInjectionContext(() => compatForm(model));

        expect(fields.name().value()).toBe('Ada');
        legacy.setValue('Grace');
        expect(fields.name().value()).toBe('Grace');
    });

    it('guards submission on validation and invokes the action for valid data', async () => {
        const model = signal({ name: '' });
        const fields = TestBed.runInInjectionContext(() => form(model, (path) => required(path.name)));
        const submittedValues: string[] = [];

        expect(await submit(fields, async () => {
            submittedValues.push(model().name);
        })).toBe(false);
        expect(submittedValues).toEqual([]);
        expect(fields.name().touched()).toBe(true);

        model.set({ name: 'Ada' });
        expect(await submit(fields, async () => {
            submittedValues.push(model().name);
        })).toBe(true);
        expect(submittedValues).toEqual(['Ada']);
    });
});
