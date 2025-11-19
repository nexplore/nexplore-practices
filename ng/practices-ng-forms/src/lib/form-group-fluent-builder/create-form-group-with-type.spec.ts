import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { describe, expect, it } from '@jest/globals';
import { formGroup } from './api';

describe('withType', () => {
    it('should create a form group with class type', () => {
        TestBed.runInInjectionContext(() => {
            class TestType {
                constructor(public name: string, public age: number) {
                }
            }

            const fg = formGroup.withType(TestType, {name: 'John Doe', age: null});

            fg.controls.age.setValue(40);

            expect(fg.value).toEqual({name: 'John Doe', age: 40});
        });
    });

    it('should create a form group with generic type', () => {
        TestBed.runInInjectionContext(() => {
            interface TestType {
                name: string;
                age: number;
            }

            const fg = formGroup.withType<TestType>().withConfig({name: {value: 'John Doe'}, age: {nullable: true}});

            fg.controls.age.setValue(40);

            expect(fg.value).toEqual({name: 'John Doe', age: 40});
        });
    });

    it('should create a form group with generic type and signal', () => {
        TestBed.runInInjectionContext(() => {
            interface TestType {
                name: string;
                age: number;
            }

            const testSignal = signal<TestType>({name: 'John Doe', age: 40});
            const fg = formGroup.withType<TestType>().withResetFromSignal(testSignal, {
                name: {nullable: false},
                age: {nullable: true}
            })

            TestBed.flushEffects();


            expect(fg.value).toEqual({name: 'John Doe', age: 40});
        });
    });

    it('should create a form group with definition config', () => {
        TestBed.runInInjectionContext(() => {
            class TestType {
                constructor(public name: string, public age: number) {
                }
            }

            const fg = formGroup.withType(TestType, {
                name: {
                    nullable: true,
                },
                age: {
                    nullable: false,
                },
            });

            expect(fg.value).toEqual({name: null, age: null});
        });
    });

    it('should work with extensions', () => {
        TestBed.runInInjectionContext(() => {
            class TestType {
                constructor(public name: string | null, public age: number) {
                }
            }

            const fg = formGroup
                .withType(TestType, {name: null, age: null})
                .withResetFromSignal(signal({name: 'Lara Croft', age: 0}))
                .withValidation(({dependent}) => ({
                    name: [Validators.required],
                    age: [dependent(({name}) => !name && Validators.required)],
                }));

            TestBed.flushEffects();

            fg.controls.age.setValue(30);

            const value = fg.value;

            expect(value).toEqual({name: 'Lara Croft', age: 30});
        });
    });

    it('should work with large type', () => {
        TestBed.runInInjectionContext(() => {
            // This test does not do anything, it's just for "testing" that it compiles
            class MyDto {
                constructor(
                    public svnumber: string | null,
                    public basicText: string | null,
                    public basicTextWithNotice: string | null,
                    public basicNumber: number | null,
                    public basicDate: Date | null,
                    public birthDate: Date | null,
                    public monthDate: Date | null,
                    public year: number | null,
                    public basicCombobox: number | null,
                    public requiredCombobox: number,
                    public asyncCombobox: number | null,
                    public nonSearchableCombobox: number | null,
                    public requiredText: string,
                    public requiredNumber: number,
                    public inputWithPlaceholder: string | null,
                    public inputWithHiddenOptionalLabel: string | null,
                    public requiredInputWithInitialValue: string,
                    public validatorWithParameter: number | null,
                    public asyncValidator: string | null,
                    public disabled: string,
                    public basicTextWithCustomId: string | null,
                    public basic1: boolean | null,
                    public basic2: boolean | null,
                    public basic3: boolean | null,
                    public basic4: boolean | null,
                    public basic5: boolean | null,
                    public radio: string | null,
                    public file: File | null,
                    public requiredFile: File
                ) {
                }
            }

            const fg = formGroup
                .withType(MyDto, {
                    svnumber: '',
                    basicText: null,
                    basicTextWithNotice: null,
                    basicNumber: null,
                    basicDate: null,
                    birthDate: null,
                    monthDate: null,
                    year: null,
                    basicCombobox: null,
                    requiredCombobox: null,
                    asyncCombobox: null,
                    nonSearchableCombobox: null,
                    requiredText: null,
                    requiredNumber: null,
                    inputWithPlaceholder: null,
                    inputWithHiddenOptionalLabel: null,
                    requiredInputWithInitialValue: null,
                    validatorWithParameter: null,
                    asyncValidator: null,
                    disabled: null,
                    basicTextWithCustomId: null,
                    basic1: null,
                    basic2: null,
                    basic3: null,
                    basic4: null,
                    basic5: null,
                    radio: null,
                    file: null,
                    requiredFile: null,
                })
                .withValidation(({dependent}) => ({
                    svnumber: [],
                    basicText: [],
                    basicTextWithNotice: [],
                    basicNumber: [],
                    basicDate: [],
                    birthDate: [],
                    monthDate: [],
                    year: [
                        dependent(
                            ({birthDate, year}) =>
                                year &&
                                birthDate &&
                                year < birthDate.getFullYear() && {yearMustBeAfterBirthDate: true}
                        ),
                    ],
                    basicCombobox: [],
                    requiredCombobox: [Validators.required],
                    asyncCombobox: [],
                    nonSearchableCombobox: [],
                    requiredText: [Validators.required],
                    requiredNumber: [Validators.required],
                    inputWithPlaceholder: [],
                    inputWithHiddenOptionalLabel: [],
                    requiredInputWithInitialValue: [Validators.required],
                    validatorWithParameter: [Validators.min(4)],
                    asyncValidator: [],
                    disabled: [],
                    basicTextWithCustomId: [],
                    basic1: [],
                    basic2: [],
                    basic3: [],
                    basic4: [],
                    basic5: [],
                    radio: [],
                    file: [],
                    requiredFile: [Validators.required],
                }));

            fg.controls.basicText.setValue('tests');
        });
    });
});
