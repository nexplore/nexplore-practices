import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { formGroup } from './api';

describe('signal form smoke', () => {
    it('works', () => {
        TestBed.runInInjectionContext(() => {
            const flag = signal(false);
            const fg = formGroup
                .withBuilder(({ control, group, array }) => ({
                    name: control('John'),
                    pw: control(''),
                    pw2: control(''),
                    address: group({ street: control('x') }),
                    items: array([control('a')]),
                }))
                .withValidation(({ conditional, dependent }) => ({
                    name: [Validators.required, conditional(() => flag() && Validators.minLength(10))],
                    pw2: [dependent(({ pw, pw2 }) => pw !== pw2 && { mismatch: true })],
                }));
            expect(fg.value).toEqual({ name: 'John', pw: '', pw2: '', address: { street: 'x' }, items: ['a'] });
            expect(fg.valid).toBe(true);
            flag.set(true);
            expect(fg.controls.name.errors).toEqual({ minlength: { requiredLength: 10, actualLength: 4 } });
            fg.controls.pw.setValue('a');
            expect(fg.controls.pw2.errors).toEqual({ mismatch: true });
            expect(fg.controls.name.fieldState.required()).toBe(true);
            fg.controls.items.push('b');
            expect(fg.value.items).toEqual(['a', 'b']);
            const s: string = fg.value.name!;
            expect(s).toBe('John');
        });
    });
});
