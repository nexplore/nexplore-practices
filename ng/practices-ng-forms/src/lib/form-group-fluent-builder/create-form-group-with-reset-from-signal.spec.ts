import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { formGroup } from './api';
import { createFormGroupWithResetFromSignal } from './create-form-group-with-reset-from-signal';

describe('withResetFromSignal', () => {
    it('should create a form group with reset from a signal', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const sourceSignal = signal({
                firstName: 'Lara',
                lastName: 'Croft',
                unneeded: 2,
            });
            const formGroup = createFormGroupWithResetFromSignal(sourceSignal, { firstName: '', lastName: null });

            formGroup.valueSignal.lastName();
            results.push(formGroup.value.firstName);

            TestBed.flushEffects();

            results.push(formGroup.value.firstName);

            sourceSignal.set({ firstName: 'Indiana', lastName: 'Jones', unneeded: 3 });
            TestBed.flushEffects();

            results.push(formGroup.value.firstName);

            expect(results).toEqual(['', 'Lara', 'Indiana']);
        });
    });

    it('should create a form group with reset from a signal', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const sourceSignal = signal({ name: 'Lara Croft' });
            const fg = formGroup.withResetFromSignal(sourceSignal, { name: '' });

            results.push(fg.value.name);

            TestBed.flushEffects();

            results.push(fg.value.name);

            sourceSignal.set({ name: 'Indiana Jones' });
            TestBed.flushEffects();

            results.push(fg.value.name);

            expect(results).toEqual(['', 'Lara Croft', 'Indiana Jones']);
        });
    });

    it('should work with non-nullable', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal({ name: 'Lara Croft' });
            const fg = formGroup.withResetFromSignal(sourceSignal, { name: { nullable: false } });
            TestBed.flushEffects();

            const name: string = fg.value.name;
            expect(name).toEqual('Lara Croft');
        });
    });

    it('should work with nullable', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal({ name: 'Lara Croft' });
            const fg = formGroup.withResetFromSignal(sourceSignal, { name: { nullable: true } });
            TestBed.flushEffects();

            const name: string | null = fg.value.name;
            expect(name).toEqual('Lara Croft');
        });
    });

    it('should work with nullable 2', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal<{ name?: string }>({ name: 'Lara Croft' });
            const fg = formGroup.withResetFromSignal(sourceSignal, { name: { nullable: true } });
            TestBed.flushEffects();

            const name: string | null | undefined = fg.value.name;
            expect(name).toEqual('Lara Croft');
        });
    });

    it('should work with extensions', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal({ name: 'Lara Croft' });
            const fg = formGroup
                .withResetFromSignal(sourceSignal, { name: '' })
                .withValidation({ name: [Validators.required] });
            TestBed.flushEffects();

            expect(fg.value.name).toEqual('Lara Croft');
        });
    });
});
