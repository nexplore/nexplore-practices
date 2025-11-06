import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { formGroup } from './api';
import { FormGroupDefinitionRecord } from './types';

describe('withBuilder', () => {
    it('should create a basic form group', () => {
        TestBed.runInInjectionContext(() => {
            const fg = formGroup.withBuilder(() => ({ name: { value: 'John Doe' } }));
            fg.controls.name.setValue('John Doe');
            expect(fg.value).toEqual({ name: 'John Doe' });

            expect(fg.getRawValue()).toEqual({ name: 'John Doe' });
        });
    });

    it('should create a form group with nullable values', () => {
        TestBed.runInInjectionContext(() => {
            const fg = formGroup.withBuilder(() => ({ name: { value: 'John Doe', nullable: true } }));
            fg.controls.name.setValue(null);
            expect(fg.value.name).toBeNull();
        });
    });

    it('should pass FormBuilder as first argument', () => {
        TestBed.runInInjectionContext(() => {
            const fg = formGroup.withBuilder((fb) => ({ name: fb.control('John Doe') }));
            expect(fg.value.name).toBe('John Doe');
        });
    });

    it('should pass FormBuilder as first argument and allow destructuring', () => {
        TestBed.runInInjectionContext(() => {
            const fg = formGroup.withBuilder(({ control }) => ({ name: control('John Doe') }));
            expect(fg.value.name).toBe('John Doe');
        });
    });

    it('should update controls based on signals when using factory function', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal<FormGroupDefinitionRecord<any>>({ name: { value: 'Lara Croft' } });

            const results: any[] = [];

            const fg = formGroup.withBuilder(() => sourceSignal());

            results.push(Object.keys(fg.controls));

            sourceSignal.set({ name: { value: 'Indiana Jones' }, age: { value: 40 } });
            TestBed.flushEffects();

            results.push(Object.keys(fg.controls));

            sourceSignal.set({ age: { value: 50 } });
            TestBed.flushEffects();

            results.push(Object.keys(fg.controls));

            expect(results).toEqual([['name'], ['name', 'age'], ['name', 'age']]);
        });
    });

    it('should update control values based on signals when using factory function', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal<FormGroupDefinitionRecord<any>>({ name: { value: 'Lara Croft' } });

            const results: any[] = [];

            const fg = formGroup.withBuilder(() => sourceSignal());

            results.push(fg.value);

            sourceSignal.set({ name: { value: 'Indiana Jones' }, age: { value: 40 } });
            TestBed.flushEffects();

            results.push(fg.value);

            sourceSignal.set({ age: { value: 50 } });
            TestBed.flushEffects();

            results.push(fg.value);

            expect(results).toEqual([{ name: 'Lara Croft' }, { name: 'Indiana Jones', age: 40 }, { age: 50 }]);
        });
    });

    it('should work with extensions', () => {
        TestBed.runInInjectionContext(() => {
            const sourceSignal = signal({ name: 'Lara Croft' });
            const fg = formGroup
                .withBuilder(() => ({ name: { value: 'John Doe' } }))
                .withResetFromSignal(sourceSignal)
                .withValidation({ name: [Validators.required] });

            TestBed.flushEffects();

            expect(fg.value.name).toEqual('Lara Croft');
        });
    });
});
