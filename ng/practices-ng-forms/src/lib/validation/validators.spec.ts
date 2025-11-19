import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, expect, it } from '@jest/globals';
import { validateConditional, validateDependent } from './validators';

describe('validateConditional', () => {
    it('Should add and remove conditional validator', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const isRequiredSignal = signal(false);
            const formControl = new FormControl(
                null,
                validateConditional(() => isRequiredSignal() && Validators.required)
            );
            TestBed.flushEffects();
            results.push(formControl.hasValidator(Validators.required));

            isRequiredSignal.set(true);
            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));
        });
        expect(results).toEqual([false, true]);
    });

    it('Should support same validator on multiple controls', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const isRequiredSignal = signal(false);
            const validator = validateConditional(() => isRequiredSignal() && Validators.required);
            const formControl1 = new FormControl(null, validator);
            const formControl2 = new FormControl(null, validator);
            TestBed.flushEffects();
            results.push(
                formControl1.hasValidator(Validators.required) && formControl2.hasValidator(Validators.required)
            );

            isRequiredSignal.set(true);
            TestBed.flushEffects();

            results.push(
                formControl1.hasValidator(Validators.required) && formControl2.hasValidator(Validators.required)
            );

            isRequiredSignal.set(false);
            TestBed.flushEffects();

            results.push(
                formControl1.hasValidator(Validators.required) && formControl2.hasValidator(Validators.required)
            );
        });
        expect(results).toEqual([false, true, false]);
    });
});

describe('validateDependent', () => {
    it('Should support changing dependent form', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const formGroup1 = new FormGroup({
                testControl: new FormControl(false),
            });

            const formGroup2 = new FormGroup({
                testControl: new FormControl(true),
            });

            const formGroupSignal = signal(formGroup1);

            const formControl = new FormControl(
                null,
                validateDependent(formGroupSignal, ({ testControl }) => testControl && Validators.required)
            );

            TestBed.flushEffects();
            results.push(formControl.hasValidator(Validators.required));

            formGroupSignal.set(formGroup2);
            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));

            formGroup1.controls.testControl.setValue(true);
            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));

            formGroup2.controls.testControl.setValue(false);
            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));
        });

        expect(results).toEqual([false, true, true, false]);
    });
});
