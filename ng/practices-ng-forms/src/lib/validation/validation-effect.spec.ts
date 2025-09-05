import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { conditionalValidationEffect } from './validation-internal.util';
import { configureFormValidationsEffect } from './validation-effect.utils';

describe('conditionalValidationEffect', () => {
    it('Should add and remove validators from control', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const formControl = new FormControl();

            const addValidatorSignal = signal(false);

            const effect = conditionalValidationEffect(formControl, () => addValidatorSignal() && Validators.required);

            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));

            addValidatorSignal.set(true);

            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required));

            effect.destroy();
        });
        expect(results).toEqual([false, true]);
    });

    it('Should add and remove array of validators from control', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const formControl = new FormControl();

            const addValidatorSignal = signal(false);

            const effect = conditionalValidationEffect(
                formControl,
                () => addValidatorSignal() && [Validators.required, Validators.email]
            );

            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required) && formControl.hasValidator(Validators.email));

            addValidatorSignal.set(true);

            TestBed.flushEffects();

            results.push(formControl.hasValidator(Validators.required) && formControl.hasValidator(Validators.email));

            effect.destroy();
        });
        expect(results).toEqual([false, true]);
    });

    it('Should remove previous validator when different validator is added', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const formControl = new FormControl();

            const validators = [Validators.required, Validators.minLength(5)];

            const validatorIndexSignal = signal<0 | 1>(0);

            const effect = conditionalValidationEffect(formControl, () => {
                const currentIndex = validatorIndexSignal();
                return validators[currentIndex];
            });

            TestBed.flushEffects();

            results.push(formControl.hasValidator(validators[0]));

            validatorIndexSignal.set(1);

            TestBed.flushEffects();

            results.push(formControl.hasValidator(validators[1]) && false === formControl.hasValidator(validators[0]));

            effect.destroy();
        });
        expect(results).toEqual([true, true]);
    });

    it('Should remove previous validators array when different validators are added', () => {
        const results: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const formControl = new FormControl();

            const validators = [
                [Validators.required, Validators.minLength(5)],
                [Validators.email, Validators.maxLength(10)],
            ];

            const validatorIndexSignal = signal<0 | 1>(0);

            const effect = conditionalValidationEffect(formControl, () => {
                const currentIndex = validatorIndexSignal();
                return validators[currentIndex];
            });

            TestBed.flushEffects();

            results.push(formControl.hasValidator(validators[0][0]) && formControl.hasValidator(validators[0][1]));

            validatorIndexSignal.set(1);

            TestBed.flushEffects();

            results.push(
                formControl.hasValidator(validators[1][0]) &&
                    formControl.hasValidator(validators[1][1]) &&
                    false === formControl.hasValidator(validators[0][0]) &&
                    false === formControl.hasValidator(validators[0][1])
            );

            effect.destroy();
        });
        expect(results).toEqual([true, true]);
    });
});

describe('configureFormValidationsEffect', () => {
    describe('dependent', () => {
        it('Should re-evaluate when dependent control value changes', () => {
            const results: boolean[] = [];
            TestBed.runInInjectionContext(() => {
                const formGroup = new FormGroup({
                    control: new FormControl(null),
                    dependent: new FormControl(false),
                });

                configureFormValidationsEffect(formGroup, ({ dependent }) => ({
                    control: dependent(({ dependent }) => dependent && Validators.required),
                    dependent: [],
                }));

                TestBed.flushEffects();
                results.push(formGroup.controls.control.hasValidator(Validators.required));

                formGroup.controls.dependent.setValue(true);

                TestBed.flushEffects();
                results.push(formGroup.controls.control.hasValidator(Validators.required));

                formGroup.controls.dependent.setValue(false);

                TestBed.flushEffects();
                results.push(formGroup.controls.control.hasValidator(Validators.required));
            });

            expect(results).toEqual([false, true, false]);
        });
    });
});
