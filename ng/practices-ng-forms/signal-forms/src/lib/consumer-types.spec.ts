/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions */
/**
 * Compile-only consumer type test: jest type checks this file under the strict compiler options.
 * A regression in the inferred types (e.g. `any` or `unknown` creeping in) fails the compilation of this file.
 */
import { signal, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { formGroup, createFormGroup, createFormGroupWithResetFromSignal, createFormGroupWithType } from '../index';
import type { SignalFormArray, SignalFormControl, SignalFormGroup } from '../index';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assertType = <T extends true>(): T | void => undefined;
type IsAny<T> = 0 extends 1 & T ? true : false;
type IsUnknown<T> = unknown extends T ? ([T] extends [null] ? false : IsAny<T> extends true ? false : true) : false;

class PersonDto {
    firstName = '';
    lastName: string | null = null;
    age = 0;
}

describe('consumer types of the signal forms factories', () => {
    it('compiles', () => {
        TestBed.runInInjectionContext(() => {
            // builder syntax: control() is nullable by default, like FormBuilder.control
            const built = formGroup.withBuilder(({ control, group, array }) => ({
                name: control('x'),
                strict: control('x', { nonNullable: true }),
                age: control<number>(1),
                address: group({ street: control('s'), zip: control<number | null>(null) }),
                tags: array([control('a')]),
            }));

            assertType<Equal<typeof built.value.name, string | null>>();
            assertType<Equal<typeof built.value.strict, string>>();
            assertType<Equal<typeof built.value.age, number | null>>();
            assertType<Equal<typeof built.value.address, { street: string | null; zip: number | null }>>();
            assertType<Equal<typeof built.value.tags, (string | null)[]>>();
            assertType<Equal<typeof built.controls.name, SignalFormControl<string | null>>>();
            assertType<Equal<typeof built.controls.address.controls.zip.value, number | null>>();
            assertType<
                Equal<ReturnType<typeof built.controls.tags.at>, SignalFormControl<string | null> | undefined>
            >();
            assertType<Equal<typeof built.valueSignal.name, Signal<string | null>>>();
            assertType<Equal<ReturnType<typeof built.valueSignal.address>['street'], string | null>>();
            assertType<IsAny<typeof built.value> extends false ? true : false>();
            assertType<IsUnknown<typeof built.value.name> extends false ? true : false>();

            // fluent calls keep the type
            const chained = built
                .withValidation({ name: [Validators.required] })
                .withMultiFieldValidation(({ name, age }) => !name && !age && { either: true })
                .withValueChangeEffect(({ name }) => {
                    assertType<Equal<typeof name, string | null>>();
                });
            assertType<Equal<typeof chained, typeof built>>();

            // @ts-expect-error unknown control
            built.controls.nope;
            // @ts-expect-error wrong value type
            built.controls.age.setValue('text');

            // short syntax
            const short = createFormGroup({ name: { value: 'a', nullable: true }, count: { value: 1 }, plain: 'p' });
            assertType<Equal<typeof short.value.name, string | null>>();
            assertType<Equal<typeof short.value.count, number>>();
            assertType<Equal<typeof short.value.plain, string>>();

            // withType keeps the class types, adds null where defined with null
            const typed = createFormGroupWithType(PersonDto, { firstName: 'a', lastName: null, age: 3 });
            assertType<Equal<typeof typed.value.firstName, string>>();
            assertType<Equal<typeof typed.value.lastName, string | null>>();
            assertType<Equal<typeof typed.value.age, number>>();

            // @ts-expect-error property is not part of the type
            createFormGroupWithType(PersonDto, { firstName: 'a', unknownProp: 1 });

            // reset from signal
            const source = signal<PersonDto | null>(null);
            const reset = createFormGroupWithResetFromSignal(source, {
                firstName: { nullable: true },
                age: { nullable: false },
            });
            assertType<Equal<typeof reset.value.firstName, string | null>>();
            assertType<Equal<typeof reset.value.age, number>>();

            const viaFactory = formGroup.withType<PersonDto>().withConfig({
                firstName: { value: 'x' },
                lastName: { value: null, nullable: true },
                age: { value: 3 },
            });
            assertType<IsAny<typeof viaFactory.value> extends false ? true : false>();

            // structure types are exported
            assertType<Equal<typeof built.controls.tags, SignalFormArray<SignalFormControl<string | null>>>>();
            const asGroup: SignalFormGroup<any> = built;
            expect(asGroup).toBeDefined();
        });
    });
});
