import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { createExtendedFormGroup } from './extensions';

describe('formGroup', () => {
    it('should create a basic form group', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            expect(formGroup.value).toEqual({ name: 'John Doe' });

            expect(formGroup.getRawValue()).toEqual({ name: 'John Doe' });
        });
    });

    it('should create a form group with reset from a signal', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const sourceSignal = signal({ name: 'Lara Croft' });
            const formGroup = createExtendedFormGroup({ name: '' }).withResetFromSignal(sourceSignal);

            results.push(formGroup.value.name);

            TestBed.flushEffects();

            results.push(formGroup.value.name);

            sourceSignal.set({ name: 'Indiana Jones' });
            TestBed.flushEffects();

            results.push(formGroup.value.name);

            expect(results).toEqual(['', 'Lara Croft', 'Indiana Jones']);
        });
    });

    it('should create a form group whose values have signal properties', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            expect(formGroup.value.nameSignal).toBeDefined();
        });
    });

    it('should have signal properties for all status related properties', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            expect(formGroup.statusSignal).toBeDefined();
            expect(formGroup.pristineSignal).toBeDefined();
            expect(formGroup.dirtySignal).toBeDefined();
            expect(formGroup.touchedSignal).toBeDefined();
            expect(formGroup.untouchedSignal).toBeDefined();
            expect(formGroup.validSignal).toBeDefined();
            expect(formGroup.invalidSignal).toBeDefined();
        });
    });

    it('should have statusSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup((b) => ({ name: b.control('john', [Validators.required]) }));

            const results: string[] = [];

            effect(() => {
                const status = formGroup.statusSignal();
                results.push(status);
            });

            TestBed.flushEffects();

            formGroup.setValue({ name: '' });

            TestBed.flushEffects();

            expect(results).toEqual(['VALID', 'INVALID']);
        });
    });

    it('should have dirtySignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            const results: boolean[] = [];

            effect(() => {
                const dirty = formGroup.dirtySignal();
                results.push(dirty);
            });

            TestBed.flushEffects();

            formGroup.markAsDirty();

            TestBed.flushEffects();

            expect(results).toEqual([false, true]);
        });
    });

    it('should have pristineSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            const results: boolean[] = [];

            effect(() => {
                const pristine = formGroup.pristineSignal();
                results.push(pristine);
            });

            formGroup.markAsDirty();
            TestBed.flushEffects();

            formGroup.markAsPristine();

            TestBed.flushEffects();

            expect(results).toEqual([false, true]);
        });
    });

    it('should have touchedSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            const results: boolean[] = [];

            effect(() => {
                const touched = formGroup.touchedSignal();
                results.push(touched);
            });

            TestBed.flushEffects();

            formGroup.markAsTouched();

            TestBed.flushEffects();

            expect(results).toEqual([false, true]);
        });
    });

    it('should have untouchedSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            const results: boolean[] = [];

            effect(() => {
                const untouched = formGroup.untouchedSignal();
                results.push(untouched);
            });

            formGroup.markAsTouched();

            TestBed.flushEffects();

            formGroup.markAsUntouched();

            TestBed.flushEffects();

            expect(results).toEqual([false, true]);
        });
    });

    it('should have validSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup((b) => ({ name: b.control('john', [Validators.required]) }));

            const results: boolean[] = [];

            effect(() => {
                const valid = formGroup.validSignal();
                results.push(valid);
            });

            TestBed.flushEffects();

            formGroup.setValue({ name: '' });

            TestBed.flushEffects();

            expect(results).toEqual([true, false]);
        });
    });

    it('should have invalidSignal update when the form group status changes', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup((b) => ({ name: b.control('john', [Validators.required]) }));

            const results: boolean[] = [];

            effect(() => {
                const invalid = formGroup.invalidSignal();
                results.push(invalid);
            });

            TestBed.flushEffects();

            formGroup.setValue({ name: '' });

            TestBed.flushEffects();

            expect(results).toEqual([false, true]);
        });
    });

    it('should be able to listen to control value changes through signals', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });

            const results: string[] = [];

            effect(() => {
                const name = formGroup.value.nameSignal();
                results.push(name);
            });

            TestBed.flushEffects();

            formGroup.patchValue({ name: 'Jane Doe' });

            TestBed.flushEffects();

            expect(results).toEqual(['John Doe', 'Jane Doe']);
        });
    });

    it('should return a value whose keys are not including the signal properties', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });
            TestBed.flushEffects();

            expect(Object.keys(formGroup.value)).toEqual(['name']);
        });
    });

    it('should return a value which can be used in Object.assign without the signal properties', () => {
        TestBed.runInInjectionContext(() => {
            const formGroup = createExtendedFormGroup({ name: 'John Doe' });
            TestBed.flushEffects();

            const obj = Object.assign({}, formGroup.value);

            expect(obj).toEqual({ name: 'John Doe' });
        });
    });

    it('should validate a form group', () => {
        TestBed.runInInjectionContext(() => {
            const results: boolean[] = [];

            const formGroup = createExtendedFormGroup({ name: '' }).withValidation({
                name: [Validators.minLength(3), Validators.required],
            });

            results.push(formGroup.valid);

            TestBed.flushEffects();

            results.push(formGroup.valid);

            formGroup.patchValue({ name: 'Jo' });

            results.push(formGroup.valid);

            formGroup.patchValue({ name: 'John' });

            results.push(formGroup.valid);

            expect(results).toEqual([true, false, false, true]);
        });
    });
});
