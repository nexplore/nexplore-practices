import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, Validators } from '@angular/forms';
import { timer, map } from 'rxjs';
import { formGroup } from '../form-group-fluent-builder/api';
import { PuiValidators } from '../validation/validators';
import { serverError } from './nodes';

const inContext = <T>(fn: () => T): T => TestBed.runInInjectionContext(fn);

describe('signal form nodes', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('structure and values', () => {
        it('owns its state in the signal form tree: writes through the field tree are visible in the facade', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group }) => ({
                    name: control('a'),
                    address: group({ street: control('s') }),
                }));
                fg.controls.name.fieldTree().value.set('changed');
                fg.fieldTree.address.street().value.set('new street');
                expect(fg.value).toEqual({ name: 'changed', address: { street: 'new street' } });
                expect(fg.controls.address.controls.street.value).toBe('new street');
                expect(fg.get('address.street')).toBe(fg.controls.address.controls.street);
                expect(fg.get(['address', 'street'])?.pathKeys).toEqual(['address', 'street']);
                expect(fg.get('address.nope')).toBeNull();
            }));

        it('treats undefined initial values as null and keeps object values (DTOs) in a control', () =>
            inContext(() => {
                const dto = { id: 1, label: 'x' };
                const fg = formGroup.withBuilder(({ control }) => ({
                    a: control<string | undefined>(undefined),
                    labelDto: control<{ id: number; label: string } | null>(dto),
                }));
                expect(fg.value.a).toBeNull();
                expect(fg.value.labelDto).toEqual(dto);
                fg.controls.labelDto.setValue(null);
                expect(fg.value.labelDto).toBeNull();
            }));

        it('excludes disabled controls from value but not from raw value; a fully disabled group exposes everything', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('a'), b: control('b') }));
                fg.controls.a.disable();
                expect(fg.value).toEqual({ b: 'b' });
                expect(fg.getRawValue()).toEqual({ a: 'a', b: 'b' });
                fg.controls.b.disable();
                expect(fg.disabled).toBe(true);
                expect(fg.status).toBe('DISABLED');
                expect(fg.value).toEqual({ a: 'a', b: 'b' });
                fg.enable();
                expect(fg.value).toEqual({ a: 'a', b: 'b' });
                expect(fg.status).toBe('VALID');
            }));

        it('honors disabled in definitions and enable() overrides it', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({
                    a: control({ value: 'a', disabled: true }),
                    b: control('b'),
                }));
                expect(fg.controls.a.disabled).toBe(true);
                fg.controls.a.enable();
                expect(fg.controls.a.disabled).toBe(false);
            }));

        it('setValue requires all controls, patchValue ignores unknown ones', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('a'), b: control('b') }));
                expect(() => fg.setValue({ a: 'x' } as any)).toThrow(/Must supply a value/);
                fg.patchValue({ a: 'x', nope: 1 } as any);
                expect(fg.value).toEqual({ a: 'x', b: 'b' });
                fg.setValue({ a: '1', b: '2' });
                expect(fg.value).toEqual({ a: '1', b: '2' });
            }));

        it('updateOn blur keeps the model unchanged until blur (control value differs)', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('a', { updateOn: 'blur' }) }));
                expect(fg.controls.a.updateOn).toBe('blur');
                fg.controls.a.fieldState.controlValue.set('typed');
                TestBed.tick();
                expect(fg.controls.a.controlValue).toBe('typed');
                expect(fg.controls.a.value).toBe('a');
                fg.controls.a.fieldState.markAsTouched();
                TestBed.tick();
                expect(fg.controls.a.value).toBe('typed');
            }));
    });

    describe('arrays', () => {
        it('push, insert, removeAt, clear and per item state', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, array }) => ({
                    items: array([control('a', [Validators.required])]),
                }));
                const items = fg.controls.items;
                items.push('b');
                items.insert(0, 'z');
                expect(fg.value.items).toEqual(['z', 'a', 'b']);
                items.removeAt(0);
                expect(items.length).toBe(2);
                expect(fg.value.items).toEqual(['a', 'b']);
                items.at(0)!.setValue('');
                expect(items.at(0)!.errors).toEqual({ required: true });
                expect(items.valid).toBe(false);
                items.clear();
                expect(items.length).toBe(0);
                expect(fg.valid).toBe(true);
                expect(items.at(5)).toBeUndefined();
            }));

        it('state of object items follows the item when others are removed', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group, array }) => ({
                    people: array([group({ name: control('') })]),
                }));
                const people = fg.controls.people;
                people.push({ name: 'second' });
                people.push({ name: 'third' });
                people.at(2)!.markAsDirty();
                people.at(2)!.get('name')!.markAsDirty();
                people.removeAt(0);
                expect(people.length).toBe(2);
                expect(people.at(1)!.get('name')!.dirty).toBe(true);
                expect(people.at(0)!.get('name')!.dirty).toBe(false);
            }));

        it('arrays of groups: nested validators apply to new items and paths resolve', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group, array }) => ({
                    people: array([group({ name: control('x', [Validators.required]), age: control(1) })]),
                }));
                fg.controls.people.push({ name: '', age: 2 });
                expect(fg.controls.people.length).toBe(2);
                expect(fg.get('people.1.name')?.errors).toEqual({ required: true });
                expect(fg.get(['people', 0, 'name'])?.errors).toBeNull();
                expect(fg.value.people).toEqual([
                    { name: 'x', age: 1 },
                    { name: '', age: 2 },
                ]);
            }));

        it('push() without value uses the item template; push(definition) registers it', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, array }) => ({
                    items: array([control('tpl', { nonNullable: true })]),
                }));
                fg.controls.items.push();
                expect(fg.value.items).toEqual(['tpl', 'tpl']);
            }));
    });

    describe('flags', () => {
        it('markAsPristine keeps touched, markAsUntouched keeps dirty', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('a') }));
                fg.controls.a.markAsDirty();
                fg.controls.a.markAsTouched();
                fg.markAsPristine();
                expect(fg.controls.a.dirty).toBe(false);
                expect(fg.controls.a.touched).toBe(true);
                fg.controls.a.markAsDirty();
                fg.markAsUntouched();
                expect(fg.controls.a.touched).toBe(false);
                expect(fg.controls.a.dirty).toBe(true);
            }));

        it('markAsTouched does not touch descendants, markAllAsTouched does', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group }) => ({ nested: group({ b: control('b') }) }));
                fg.controls.nested.markAsTouched();
                expect(fg.controls.nested.controls.b.touched).toBe(false);
                fg.markAllAsTouched();
                expect(fg.controls.nested.controls.b.touched).toBe(true);
                fg.markAllAsDirty();
                expect(fg.dirty).toBe(true);
            }));

        it('readonly and hidden state are published on the field state, readonly fields are not validated', () =>
            inContext(() => {
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('', [Validators.required]) }))
                    .withValidation({});
                expect(fg.valid).toBe(false);
                fg.controls.a.setReadonly(true);
                expect(fg.controls.a.fieldState.readonly()).toBe(true);
                expect(fg.valid).toBe(true);
                fg.controls.a.setReadonly(false);
                fg.controls.a.setHidden(true);
                expect(fg.controls.a.hidden).toBe(true);
                expect(fg.controls.a.readonlySignal()).toBe(false);
            }));

        it('setErrors marks invalid until the value changes or errors are cleared', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('x') }));
                fg.controls.a.setErrors({ server: { code: 1 } });
                expect(fg.valid).toBe(false);
                expect(fg.controls.a.errors).toEqual({ server: { code: 1 } });
                fg.controls.a.setErrors(null);
                expect(fg.valid).toBe(true);
            }));
    });

    describe('validators', () => {
        it('add / remove / has / set / clear validators', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('') }));
                const a = fg.controls.a;
                a.addValidators(Validators.required);
                expect(a.hasValidator(Validators.required)).toBe(true);
                expect(a.errors).toEqual({ required: true });
                a.removeValidators(Validators.required);
                expect(a.errors).toBeNull();
                a.setValidators([Validators.minLength(2)]);
                a.setValue('x');
                expect(a.errors).toEqual({ minlength: { requiredLength: 2, actualLength: 1 } });
                a.clearValidators();
                expect(a.valid).toBe(true);
            }));

        it('publishes native rule metadata for Validators.required and PuiValidators', () =>
            inContext(() => {
                const fg = formGroup
                    .withBuilder(({ control }) => ({
                        a: control(''),
                        n: control(5),
                        s: control('abc'),
                    }))
                    .withValidation({
                        a: [Validators.required],
                        n: [PuiValidators.min(3), PuiValidators.max(10)],
                        s: [PuiValidators.minLength(2), PuiValidators.maxLength(4), PuiValidators.pattern(/^[a-z]+$/)],
                    });
                expect(fg.controls.a.fieldState.required()).toBe(true);
                expect(fg.controls.n.fieldState.min?.()).toBe(3);
                expect(fg.controls.n.fieldState.max?.()).toBe(10);
                expect(fg.controls.s.fieldState.minLength?.()).toBe(2);
                expect(fg.controls.s.fieldState.maxLength?.()).toBe(4);
                expect(fg.controls.s.fieldState.pattern().map(String)).toEqual(['/^[a-z]+$/']);
                fg.controls.n.setValue(1);
                expect(fg.controls.n.errors).toEqual({ min: { min: 3, actual: 1 } });
                fg.controls.s.setValue('ABCDE');
                expect(Object.keys(fg.controls.s.errors!).sort()).toEqual(['maxlength', 'pattern']);
            }));

        it('conditional validators react to signals without effects and can be removed', () =>
            inContext(() => {
                const on = signal(false);
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('') }))
                    .withValidation(({ conditional }) => ({ a: [conditional(() => on() && Validators.required)] }));
                expect(fg.valid).toBe(true);
                on.set(true);
                expect(fg.valid).toBe(false);
                on.set(false);
                expect(fg.valid).toBe(true);
            }));

        it('conditional validators accept error literals and arrays', () =>
            inContext(() => {
                const mode = signal<'none' | 'literal' | 'array'>('none');
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('') }))
                    .withValidation(({ conditional }) => ({
                        a: [
                            conditional(() =>
                                mode() === 'literal'
                                    ? { custom: true }
                                    : mode() === 'array'
                                    ? [Validators.required, () => ({ other: 1 })]
                                    : null
                            ),
                        ],
                    }));
                expect(fg.controls.a.errors).toBeNull();
                mode.set('literal');
                expect(fg.controls.a.errors).toEqual({ custom: true });
                mode.set('array');
                expect(fg.controls.a.errors).toEqual({ required: true, other: 1 });
            }));

        it('validators see the control: value, parent and siblings', () =>
            inContext(() => {
                const sameAsSibling = (c: AbstractControl) =>
                    c.value !== c.parent?.get('first')?.value ? { differs: true } : null;
                const fg = formGroup.withBuilder(({ control }) => ({
                    first: control('a'),
                    second: control('a', [sameAsSibling]),
                }));
                expect(fg.controls.second.valid).toBe(true);
                fg.controls.first.setValue('b');
                expect(fg.controls.second.errors).toEqual({ differs: true });
            }));

        it('multi field validation works in nested groups with dotted control names and mixes with other validators', () =>
            inContext(() => {
                const fg = formGroup
                    .withBuilder(({ control, group }) => ({
                        top: control(''),
                        range: group({ from: control(5), to: control(1) }),
                    }))
                    .withValidation({ top: [Validators.required] });
                fg.controls.range.withMultiFieldValidation(
                    ({ from, to }) => (from ?? 0) > (to ?? 0) && { badRange: true }
                );
                expect(fg.controls.range.controls.from.errors).toEqual({ badRange: true });
                expect(fg.controls.range.controls.to.errors).toEqual({ badRange: true });
                expect(fg.controls.top.errors).toEqual({ required: true });
                fg.controls.range.controls.to.setValue(9);
                expect(fg.controls.range.controls.to.errors).toBeNull();
                fg.withMultiFieldValidation(({ top }) => top === 'x' && { topIsX: true }, ['range.to']);
                fg.controls.top.setValue('x');
                expect(fg.get('range.to')?.errors).toEqual({ topIsX: true });
                expect(fg.get('range.from')?.errors).toBeNull();
            }));

        it('group level validators land on the group', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group }) => ({
                    g: group({ a: control('') }, { validators: [() => ({ groupError: true })] }),
                }));
                expect(fg.controls.g.errors).toEqual({ groupError: true });
                expect(fg.controls.g.controls.a.errors).toBeNull();
                expect(fg.invalid).toBe(true);
            }));
    });

    describe('async validation', () => {
        const slowTaken = (ms: number) => (c: AbstractControl) =>
            timer(ms).pipe(map(() => (c.value === 'taken' ? { taken: true } : null)));
        const wait = async (ms: number) => {
            await new Promise((r) => setTimeout(r, ms));
            TestBed.tick();
        };

        it('async conditional validators follow signals', async () =>
            inContext(async () => {
                const on = signal(false);
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('taken') }))
                    .withValidation(({ asyncConditional }) => ({
                        a: [asyncConditional(() => on() && [slowTaken(5)])],
                    }));
                await wait(30);
                expect(fg.valid).toBe(true);
                on.set(true);
                TestBed.tick();
                expect(fg.pending).toBe(true);
                await wait(40);
                expect(fg.controls.a.errors).toEqual({ taken: true });
                on.set(false);
                await wait(10);
                expect(fg.valid).toBe(true);
            }));

        it('async validators from withValidation(async) and promises are supported', async () =>
            inContext(async () => {
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('taken') }))
                    .withValidation(({ async }) => ({
                        a: [async(async (c) => (c.value === 'taken' ? { viaPromise: true } : null))],
                    }));
                await wait(30);
                expect(fg.controls.a.errors).toEqual({ viaPromise: true });
            }));

        it('merges the errors of several async validators and sees the validated value', async () =>
            inContext(async () => {
                const fg = formGroup.withBuilder(({ control }) => ({
                    a: control('x', {
                        asyncValidators: [
                            (c: AbstractControl) => timer(2).pipe(map(() => ({ one: c.value }))),
                            slowTaken(2),
                        ],
                    }),
                }));
                await wait(30);
                expect(fg.controls.a.errors).toEqual({ one: 'x' });
            }));

        it('maps async validator failures to an error', async () =>
            inContext(async () => {
                const fg = formGroup.withBuilder(({ control }) => ({
                    a: control('x', {
                        asyncValidators: [
                            () =>
                                timer(2).pipe(
                                    map(() => {
                                        throw new Error('boom');
                                    })
                                ),
                        ],
                    }),
                }));
                await wait(30);
                expect(fg.controls.a.errors?.['asyncValidatorError']).toBeDefined();
            }));
    });

    describe('submit', () => {
        it('does not run the action when invalid and runs onInvalid', async () =>
            inContext(async () => {
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('') }))
                    .withValidation({ a: [Validators.required] });
                const action = jest.fn(async () => undefined);
                const onInvalid = jest.fn();
                expect(await fg.submit(action, { onInvalid })).toBe(false);
                expect(action).not.toHaveBeenCalled();
                expect(onInvalid).toHaveBeenCalled();
                expect(fg.controls.a.touched).toBe(true);
            }));

        it('runs the action with the value while submitting, and turns returned server errors into field errors', async () =>
            inContext(async () => {
                const fg = formGroup.withBuilder(({ control, group }) => ({
                    a: control('v'),
                    g: group({ b: control('w') }),
                }));
                let submittingDuring = false;
                let received: unknown;
                const ok = await fg.submit(async (value) => {
                    submittingDuring = fg.submitting;
                    received = value;
                    return [
                        serverError(fg.controls.a, 'taken', { x: 1 }, 'a is taken'),
                        serverError(fg.controls.g.controls.b, 'bad'),
                    ];
                });
                expect(ok).toBe(false);
                expect(submittingDuring).toBe(true);
                expect(fg.submitting).toBe(false);
                expect(received).toEqual({ a: 'v', g: { b: 'w' } });
                expect(fg.controls.a.errors).toEqual({ taken: { x: 1 } });
                expect(fg.controls.a.errorList[0].message).toBe('a is taken');
                expect(fg.controls.g.controls.b.errors).toEqual({ bad: true });
                expect(fg.errorSummary.length).toBe(2);
            }));

        it('does not wait for pending validators unless ignoreValidators is none', async () =>
            inContext(async () => {
                const fg = formGroup.withBuilder(({ control }) => ({
                    a: control('x', { asyncValidators: [() => timer(200).pipe(map(() => null))] }),
                }));
                TestBed.tick();
                expect(fg.pending).toBe(true);
                const action = jest.fn(async () => undefined);
                expect(await fg.submit(action, { ignoreValidators: 'none' })).toBe(false);
                expect(action).not.toHaveBeenCalled();
                expect(await fg.submit(action)).toBe(true);
            }));
    });

    describe('reset', () => {
        it('reset restores defaults, clears flags, and accepts partial values', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control, group }) => ({
                    a: control('init', { nonNullable: true }),
                    b: control('init'),
                    n: group({ c: control('c', { nonNullable: true }) }),
                }));
                fg.patchValue({ a: 'x', b: 'y', n: { c: 'z' } });
                fg.markAllAsTouched();
                fg.controls.a.markAsDirty();
                fg.reset();
                expect(fg.value).toEqual({ a: 'init', b: null, n: { c: 'c' } });
                expect(fg.dirty).toBe(false);
                expect(fg.touched).toBe(false);
                fg.reset({ a: 'given' });
                expect(fg.value).toEqual({ a: 'given', b: null, n: { c: 'c' } });
                fg.controls.n.reset({ c: 'only nested' });
                expect(fg.value.n).toEqual({ c: 'only nested' });
            }));
    });

    describe('observation', () => {
        it('signals are stable per node and reflect changes without effects', () =>
            inContext(() => {
                const fg = formGroup
                    .withBuilder(({ control }) => ({ a: control('') }))
                    .withValidation({ a: [Validators.required] });
                expect(fg.valueSignal).toBeDefined();
                expect(fg.validSignal).toBe(fg.validSignal);
                expect(fg.validSignal()).toBe(false);
                fg.controls.a.setValue('x');
                expect(fg.validSignal()).toBe(true);
                expect(fg.valueSignal()).toBe(fg.value);
                expect(fg.valueSignal.a()).toBe('x');
                expect(fg.rawValueSignal.a()).toBe('x');
                expect('a' in fg.valueSignal).toBe(true);
                expect(fg.controls.a.errorsSignal()).toBeNull();
                expect(fg.pendingSignal()).toBe(false);
                expect(fg.disabledSignal()).toBe(false);
                expect(fg.enabledSignal()).toBe(true);
            }));

        it('valueChanges keeps changes made before the first effect run', () =>
            inContext(() => {
                const fg = formGroup.withBuilder(({ control }) => ({ a: control('a') }));
                const seen: string[] = [];
                const sub = fg.controls.a.valueChanges.subscribe((v) => seen.push(v as string));
                fg.controls.a.setValue('b');
                TestBed.tick();
                fg.controls.a.setValue('c');
                TestBed.tick();
                expect(seen).toEqual(['b', 'c']);
                sub.unsubscribe();
            }));
    });
});
