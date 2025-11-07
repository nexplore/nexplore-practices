import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { formGroup } from './api';

describe('withValueChangeEffect', () => {
    it('should create a form group with value change effect', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const fg = formGroup
                .withBuilder(() => ({ name: { value: 'John Doe' } }))
                .withValueChangeEffect(({ name }) => {
                    results.push(name);
                });

            fg.markAsDirty();

            TestBed.tick();

            fg.controls.name.setValue('Jane Doe');
            TestBed.tick();

            expect(results).toEqual(['John Doe', 'Jane Doe']);
        });
    });

    it('should not trigger effect when value is the same', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const fg = formGroup
                .withBuilder(() => ({ name: { value: 'John Doe' } }))
                .withValueChangeEffect(({ name }) => {
                    results.push(name);
                });

            fg.markAsDirty();

            TestBed.tick();

            fg.controls.name.setValue('John Doe');
            TestBed.tick();

            expect(results).toEqual(['John Doe']);
        });
    });

    it('should not trigger effect when form is pristine', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const fg = formGroup
                .withBuilder(() => ({ name: { value: 'John Doe' } }))
                .withValueChangeEffect(({ name }) => {
                    results.push(name);
                });

            TestBed.tick();

            fg.controls.name.setValue('Jane Doe');
            TestBed.tick();

            expect(results).toEqual([]);
        });
    });

    it('should trigger effect only for the properties that are read from the effect', () => {
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const fg = formGroup
                .withBuilder(() => ({ name: { value: 'John Doe' }, age: { value: 30 } }))
                .withValueChangeEffect(({ name }) => {
                    results.push(name);
                });

            fg.markAsDirty();

            TestBed.tick();

            fg.controls.age.setValue(40);
            TestBed.tick();

            expect(results).toEqual(['John Doe']);
        });
    });
});

