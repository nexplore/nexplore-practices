import { signal } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { map, of, timer } from 'rxjs';
import type { ParityScenario } from './parity-types';

const snapshot = (form: any, ...paths: string[]) =>
    Object.fromEntries(
        paths.map((path) => {
            const node = path ? form.get(path) : form;
            return [
                path || '(root)',
                {
                    value: node.value,
                    valid: node.valid,
                    status: node.status,
                    errors: node.errors,
                    dirty: node.dirty,
                    touched: node.touched,
                    disabled: node.disabled,
                },
            ];
        })
    );

const takenValidator = (control: AbstractControl) =>
    timer(10).pipe(map(() => (control.value === 'taken' ? { taken: true } : null)));

export const SCENARIOS: ParityScenario[] = [
    {
        id: 'group-init-values',
        title: 'group initial values (value, raw value, validity, flags)',
        run: ({ formGroup, injector }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({
                name: control('John'),
                age: control(42),
                active: control(true),
            }));
            return { value: fg.value, raw: fg.getRawValue(), valid: fg.valid, dirty: fg.dirty, touched: fg.touched, pristine: fg.pristine, status: fg.status };
        },
    },
    {
        id: 'group-short-syntax',
        title: 'short definition syntax with nullable / non-nullable reset',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(() => ({
                a: { value: 'init' },
                b: { value: 'init', nullable: true },
            }));
            fg.controls.a.setValue('x');
            fg.controls.b.setValue('x');
            const before = fg.value;
            fg.reset();
            return { before, after: fg.value };
        },
    },
    {
        id: 'group-plain-record',
        title: 'plain value record definition',
        run: ({ createFormGroup }) => {
            const fg = createFormGroup({ name: 'John Doe', age: 3 });
            fg.controls.name.setValue('x');
            const a = fg.value;
            fg.reset();
            return { a, b: fg.value, raw: fg.getRawValue() };
        },
    },
    {
        id: 'group-nested',
        title: 'nested group: values, paths, validity bubbling',
        run: ({ formGroup }) => {
            const fg = formGroup
                .withBuilder(({ control, group }: any) => ({
                    name: control(''),
                    address: group({ street: control(''), zip: control('') }),
                }))
                .withValidation({ name: [Validators.required] });
            fg.get('address.street').setValue('Main');
            const a = snapshot(fg, '', 'address', 'address.street', 'name');
            fg.get('name').setValue('x');
            fg.patchValue({ address: { zip: '3000' } });
            return { before: a, after: snapshot(fg, '', 'address.zip'), controlNames: Object.keys(fg.controls) };
        },
    },
    {
        id: 'array-add-remove-validate',
        title: 'array: push, remove, per item validation, value',
        run: ({ formGroup, arrayPush }) => {
            const fg = formGroup.withBuilder(({ control, array }: any) => ({
                tags: array([control('a', [Validators.required])]),
            }));
            const tags = fg.controls.tags;
            const steps: unknown[] = [];
            steps.push({ len: tags.length, value: fg.value.tags, valid: fg.valid });
            arrayPush(tags, '', [Validators.required]);
            steps.push({ len: tags.length, value: fg.value.tags, valid: fg.valid, item1Errors: tags.at(1).errors });
            tags.at(1).setValue('b');
            steps.push({ len: tags.length, value: fg.value.tags, valid: fg.valid });
            tags.removeAt(0);
            steps.push({ len: tags.length, value: fg.value.tags, valid: fg.valid });
            return steps;
        },
    },
    {
        id: 'array-of-groups',
        title: 'array of groups: item validation and value',
        run: ({ formGroup, arrayPush, createFormGroup }) => {
            const fg = formGroup.withBuilder(({ control, group, array }: any) => ({
                people: array([group({ name: control('', [Validators.required]) })]),
            }));
            const people = fg.controls.people;
            const a = { valid: fg.valid, value: fg.value.people, err: people.at(0).get('name').errors };
            people.at(0).get('name').setValue('Ann');
            const b = { valid: fg.valid, value: fg.value.people };
            return { a, b };
        },
    },
    {
        id: 'sync-validators',
        title: 'required / min / max / minLength / maxLength / pattern / email',
        run: ({ formGroup }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({
                    req: control(''),
                    num: control(5),
                    short: control('abcdef'),
                    code: control('abc'),
                    mail: control('nope'),
                }))
                .withValidation({
                    req: [Validators.required],
                    num: [Validators.min(10), Validators.max(20)],
                    short: [Validators.minLength(2), Validators.maxLength(4)],
                    code: [Validators.pattern(/^\d+$/)],
                    mail: [Validators.email],
                });
            const bad = Object.fromEntries(['req', 'num', 'short', 'code', 'mail'].map((k) => [k, fg.controls[k].errors]));
            fg.patchValue({ req: 'x', num: 15, short: 'abc', code: '123', mail: 'a@b.ch' });
            const good = Object.fromEntries(['req', 'num', 'short', 'code', 'mail'].map((k) => [k, fg.controls[k].errors]));
            return { bad, good, valid: fg.valid };
        },
    },
    {
        id: 'custom-sync-validator',
        title: 'custom sync validator (ValidatorFn)',
        run: ({ formGroup }) => {
            const noSpaces = (c: AbstractControl): ValidationErrors | null => (/\s/.test(c.value ?? '') ? { noSpaces: { found: true } } : null);
            const fg = formGroup.withBuilder(({ control }: any) => ({ name: control('a b', [noSpaces]) }));
            const a = fg.controls.name.errors;
            fg.controls.name.setValue('ab');
            return { a, b: fg.controls.name.errors, valid: fg.valid };
        },
    },
    {
        id: 'dependent-validator',
        title: 'dependent validator (password confirmation)',
        run: ({ formGroup, flush }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ password: control(''), confirm: control('') }))
                .withValidation(({ dependent }: any) => ({
                    confirm: [dependent(({ password, confirm }: any) => password !== confirm && { mismatch: true })],
                }));
            flush();
            const steps = [fg.controls.confirm.errors];
            fg.controls.password.setValue('secret');
            flush();
            steps.push(fg.controls.confirm.errors);
            fg.controls.confirm.setValue('secret');
            flush();
            steps.push(fg.controls.confirm.errors);
            return steps;
        },
    },
    {
        id: 'dependent-validator-returns-validator',
        title: 'dependent validator returning a ValidatorFn (required only if flag set)',
        run: ({ formGroup, flush }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ needs: control(false), reason: control('') }))
                .withValidation(({ dependent }: any) => ({
                    reason: [dependent(({ needs }: any) => needs && Validators.required)],
                }));
            flush();
            const a = fg.controls.reason.errors;
            fg.controls.needs.setValue(true);
            flush();
            const b = fg.controls.reason.errors;
            fg.controls.reason.setValue('because');
            flush();
            return { a, b, c: fg.controls.reason.errors };
        },
    },
    {
        id: 'conditional-validator',
        title: 'conditional validator toggled by a signal',
        run: ({ formGroup, flush }) => {
            const on = signal(false);
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ email: control('') }))
                .withValidation(({ conditional }: any) => ({
                    email: [conditional(() => on() && Validators.required)],
                }));
            flush();
            const steps: unknown[] = [fg.controls.email.errors];
            on.set(true);
            flush();
            steps.push(fg.controls.email.errors, fg.valid);
            on.set(false);
            flush();
            steps.push(fg.controls.email.errors, fg.valid);
            return steps;
        },
    },
    {
        id: 'conditional-validator-switching',
        title: 'conditional validator replacing one validator with another',
        run: ({ formGroup, flush }) => {
            const min = signal(5);
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ age: control(7) }))
                .withValidation(({ conditional }: any) => ({ age: [conditional(() => Validators.min(min()))] }));
            flush();
            const a = fg.controls.age.errors;
            min.set(10);
            flush();
            const b = fg.controls.age.errors;
            min.set(1);
            flush();
            return { a, b, c: fg.controls.age.errors };
        },
    },
    {
        id: 'multi-field-validation',
        title: 'multi-field validation: errors on every involved control',
        run: ({ formGroup, flush }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ field1: control(null), field2: control(null), other: control('') }))
                .withMultiFieldValidation(({ field1, field2 }: any) => !field1 && !field2 && { atLeastOneFieldRequired: true });
            flush();
            const a = { f1: fg.controls.field1.errors, f2: fg.controls.field2.errors, other: fg.controls.other.errors };
            fg.controls.field1.setValue('x');
            flush();
            return { a, b: { f1: fg.controls.field1.errors, f2: fg.controls.field2.errors } };
        },
    },
    {
        id: 'multi-field-control-names',
        title: 'multi-field validation restricted to controlNames',
        run: ({ formGroup, flush }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ start: control(5), end: control(1) }))
                .withMultiFieldValidation(({ start, end }: any) => start > end && { invalidRange: true }, ['end']);
            flush();
            return { start: fg.controls.start.errors, end: fg.controls.end.errors };
        },
    },
    {
        id: 'async-validator-pending',
        title: 'async validator: pending state and resolution',
        run: async ({ formGroup, settle }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({
                user: control('', { asyncValidators: [takenValidator] }),
            }));
            await settle(40);
            const steps: unknown[] = [{ status: fg.status, pending: fg.pending }];
            fg.controls.user.setValue('taken');
            const during = { status: fg.controls.user.status, pending: fg.controls.user.pending, groupStatus: fg.status };
            await settle(40);
            steps.push(during, { status: fg.controls.user.status, errors: fg.controls.user.errors, valid: fg.valid });
            fg.controls.user.setValue('free');
            await settle(40);
            steps.push({ status: fg.controls.user.status, errors: fg.controls.user.errors, valid: fg.valid });
            return steps;
        },
    },
    {
        id: 'async-validator-cancellation',
        title: 'async validator: a newer value supersedes the pending run',
        run: async ({ formGroup, settle }) => {
            const calls: string[] = [];
            const validator = (c: AbstractControl) => {
                calls.push(c.value);
                return timer(30).pipe(map(() => (c.value === 'taken' ? { taken: true } : null)));
            };
            const fg = formGroup.withBuilder(({ control }: any) => ({ user: control('', { asyncValidators: [validator] }) }));
            await settle(60);
            calls.length = 0;
            fg.controls.user.setValue('taken');
            await settle(5);
            fg.controls.user.setValue('free');
            await settle(80);
            return { errors: fg.controls.user.errors, status: fg.controls.user.status };
        },
    },
    {
        id: 'async-skipped-when-sync-invalid',
        title: 'async validator does not run while sync validators fail',
        run: async ({ formGroup, settle }) => {
            const calls: unknown[] = [];
            const validator = (c: AbstractControl) => {
                calls.push(c.value);
                return of(null);
            };
            const fg = formGroup.withBuilder(({ control }: any) => ({
                user: control('', { validators: [Validators.required], asyncValidators: [validator] }),
            }));
            await settle(20);
            const whileInvalid = calls.length;
            fg.controls.user.setValue('x');
            await settle(20);
            return { whileInvalid, afterValid: calls.length, status: fg.status };
        },
    },
    {
        id: 'disable-enable',
        title: 'disabling excludes the control from value and validity; enabling restores it',
        run: ({ formGroup }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ a: control('', [Validators.required]), b: control('b') }))
                .withValidation({});
            const steps: unknown[] = [{ value: fg.value, raw: fg.getRawValue(), valid: fg.valid, status: fg.status }];
            fg.controls.a.disable();
            steps.push({ value: fg.value, raw: fg.getRawValue(), valid: fg.valid, aStatus: fg.controls.a.status, aErrors: fg.controls.a.errors, aDisabled: fg.controls.a.disabled });
            fg.controls.a.enable();
            steps.push({ value: fg.value, valid: fg.valid, aStatus: fg.controls.a.status });
            fg.disable();
            steps.push({ value: fg.value, status: fg.status, disabled: fg.disabled, bDisabled: fg.controls.b.disabled });
            fg.enable();
            steps.push({ status: fg.status, disabled: fg.disabled, bDisabled: fg.controls.b.disabled });
            return steps;
        },
    },
    {
        id: 'touched-dirty',
        title: 'touched / dirty transitions, markAllAsTouched, markAsPristine, reset',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(({ control, group }: any) => ({
                a: control('a'),
                nested: group({ b: control('b') }),
            }));
            const steps: Record<string, unknown> = {};
            const flags = () => ({ dirty: fg.dirty, touched: fg.touched, aDirty: fg.controls.a.dirty, aTouched: fg.controls.a.touched, bTouched: fg.get('nested.b').touched });
            steps['initial'] = flags();
            fg.controls.a.setValue('changed');
            steps['setValue'] = flags();
            fg.controls.a.markAsDirty();
            steps['markAsDirty'] = flags();
            fg.controls.a.markAsTouched();
            steps['markAsTouched'] = flags();
            fg.markAsPristine();
            steps['markAsPristine'] = flags();
            fg.markAllAsTouched();
            steps['markAllAsTouched'] = flags();
            fg.markAsUntouched();
            steps['markAsUntouched'] = flags();
            fg.controls.a.markAsDirty();
            fg.reset({ a: 'r' });
            steps['reset'] = { ...flags(), value: fg.value };
            return steps;
        },
    },
    {
        id: 'submit-valid-invalid',
        title: 'submit: action runs only when valid; all fields touched',
        run: async ({ formGroup, submit }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control('') }))
                .withValidation({ name: [Validators.required] });
            const received: unknown[] = [];
            const invalid = await submit(fg, (v: unknown) => received.push(v));
            const afterInvalid = { touched: fg.controls.name.touched, received: [...received] };
            fg.controls.name.setValue('Ann');
            const valid = await submit(fg, (v: unknown) => received.push(v));
            return { invalid, afterInvalid, valid, received };
        },
    },
    {
        id: 'error-model-shape',
        title: 'error model: errors record, hasError, getError',
        run: ({ formGroup }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ a: control('', [Validators.required, () => ({ custom: { x: 1 } })]) }))
                .withValidation({});
            const a = fg.controls.a;
            return { errors: a.errors, hasRequired: a.hasError('required'), hasCustom: a.hasError('custom'), custom: a.getError('custom'), hasNope: a.hasError('nope'), groupErrors: fg.errors, viaGroup: fg.hasError('required', ['a']) };
        },
    },
    {
        id: 'value-signal',
        title: 'valueSignal, valueSignal.x and dirty/valid/invalid/status/pristine/touched signals',
        run: ({ formGroup, flush }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control('a'), age: control(1) }))
                .withValidation({ name: [Validators.required] });
            flush();
            const read = () => ({
                full: fg.valueSignal(),
                name: fg.valueSignal.name(),
                age: fg.valueSignal.age(),
                dirty: fg.dirtySignal(),
                pristine: fg.pristineSignal(),
                valid: fg.validSignal(),
                invalid: fg.invalidSignal(),
                status: fg.statusSignal(),
                touched: fg.touchedSignal(),
                untouched: fg.untouchedSignal(),
            });
            const steps: unknown[] = [read()];
            fg.controls.name.setValue('');
            fg.controls.name.markAsDirty();
            fg.controls.name.markAsTouched();
            flush();
            steps.push(read());
            fg.controls.name.setValue('b');
            flush();
            steps.push(read());
            return steps;
        },
    },
    {
        id: 'rxjs-value-stream',
        title: 'RxJS: valueChanges of group and control',
        run: ({ formGroup, flush, collect }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control('a') }))
                .withValidation({ name: [Validators.required] });
            flush();
            const values = collect(fg.valueChanges);
            const nameValues = collect(fg.controls.name.valueChanges);
            flush();
            fg.controls.name.setValue('b');
            flush();
            fg.controls.name.setValue('');
            flush();
            fg.controls.name.setValue('c');
            flush();
            return { values, nameValues };
        },
    },
    {
        id: 'rxjs-status-stream',
        title: 'RxJS: statusChanges emissions',
        run: ({ formGroup, flush, collect }) => {
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control('a') }))
                .withValidation({ name: [Validators.required] });
            flush();
            const statuses = collect(fg.statusChanges);
            flush();
            fg.controls.name.setValue('b');
            flush();
            fg.controls.name.setValue('');
            flush();
            fg.controls.name.setValue('c');
            flush();
            return { statuses };
        },
        intentionalDifference: {
            reactive: { statuses: ['VALID', 'INVALID', 'VALID'] },
            signal: { statuses: ['INVALID', 'VALID'] },
            note: 'Reactive Forms emits statusChanges on every value update; the signal implementation emits only when the status actually changes (derived from a signal).',
        },
    },
    {
        id: 'rxjs-emission-timing',
        title: 'RxJS: valueChanges emits synchronously vs after effect flush',
        run: ({ formGroup, flush, collect }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ name: control('a') }));
            flush();
            const values = collect(fg.controls.name.valueChanges);
            fg.controls.name.setValue('b');
            fg.controls.name.setValue('c');
            const beforeFlush = [...values];
            flush();
            return { beforeFlush, afterFlush: [...values] };
        },
        intentionalDifference: {
            reactive: { beforeFlush: ['b', 'c'], afterFlush: ['b', 'c'] },
            signal: { beforeFlush: [], afterFlush: ['c'] },
            note: 'valueChanges of the signal implementation is derived with toObservable: emissions are coalesced and delivered when effects flush; Reactive Forms emits synchronously for every set.',
        },
    },
    {
        id: 'validators-effective-before-flush',
        title: 'withValidation takes effect immediately vs after effect flush',
        run: ({ rawFormGroup }) => {
            const fg = rawFormGroup
                .withBuilder(({ control }: any) => ({ a: control('') }))
                .withValidation({ a: [Validators.required] });
            return { valid: fg.valid, errors: fg.controls.a.errors };
        },
        intentionalDifference: {
            reactive: { valid: true, errors: null },
            signal: { valid: false, errors: { required: true } },
            note: 'Reactive Forms registers validators from an effect, so validity is stale until effects ran; with signal forms validators are logic of the field tree and apply immediately.',
        },
    },
    {
        id: 'array-new-item-validators',
        title: 'array: validators of new items',
        run: ({ formGroup, arrayPush }) => {
            const fg = formGroup.withBuilder(({ control, array }: any) => ({
                tags: array([control('a', [Validators.required])]),
            }));
            arrayPush(fg.controls.tags, '');
            return { valid: fg.valid, errors: fg.controls.tags.at(1).errors };
        },
        intentionalDifference: {
            reactive: { valid: true, errors: null },
            signal: { valid: false, errors: { required: true } },
            note: 'Items added to a signal array follow the schema of the array (validators of the first item definition); with FormArray a pushed control carries only the validators it was created with.',
        },
    },
    {
        id: 'array-reset-with-value',
        title: 'array: reset with a value of different length',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(({ control, array }: any) => ({ tags: array([control('a')]) }));
            fg.reset({ tags: ['x', 'y', 'z'] });
            return { length: fg.controls.tags.length, value: fg.value.tags };
        },
        intentionalDifference: {
            reactive: { length: 1, value: ['x'] },
            signal: { length: 3, value: ['x', 'y', 'z'] },
            note: 'FormArray.reset keeps its number of controls and ignores surplus values; the signal array is resized to the given value.',
        },
    },
    {
        id: 'readonly-state',
        title: 'readonly state of a control',
        run: ({ implementation, formGroup }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ a: control('a', [Validators.required]) }));
            if (implementation === 'reactive') {
                return 'not available';
            }
            fg.controls.a.setReadonly(true);
            const a = { readonly: fg.controls.a.readonly, value: fg.value, valid: fg.valid };
            fg.controls.a.setValue('');
            return { a, validWhenEmptyAndReadonly: fg.valid };
        },
        intentionalDifference: {
            reactive: 'not available',
            signal: { a: { readonly: true, value: { a: 'a' }, valid: true }, validWhenEmptyAndReadonly: true },
            note: 'Reactive Forms controls have no readonly state (the library handles readonly in UI components and the behavior that removes validators). Signal forms have a readonly field state; readonly fields are not validated.',
        },
    },
    {
        id: 'submit-server-errors',
        title: 'submit: server errors, submitting state',
        run: async ({ implementation, formGroup }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ email: control('a@b.ch') }));
            if (implementation === 'reactive') {
                return 'not available';
            }
            const { serverError } = await import('../index');
            let duringSubmitting = false;
            const ok = await fg.submit(async () => {
                duringSubmitting = fg.submitting;
                return serverError(fg.controls.email, 'emailTaken', { by: 'someone' });
            });
            const result = { ok, duringSubmitting, after: fg.submitting, errors: fg.controls.email.errors, valid: fg.valid };
            fg.controls.email.setValue('c@d.ch');
            return { ...result, afterEdit: fg.controls.email.errors };
        },
        intentionalDifference: {
            reactive: 'not available',
            signal: {
                ok: false,
                duringSubmitting: true,
                after: false,
                errors: { emailTaken: { by: 'someone' } },
                valid: false,
                afterEdit: null,
            },
            note: 'submit(), the submitting state and server errors are Signal Forms features; with Reactive Forms the application handles them itself.',
        },
    },
    {
        id: 'reset-from-signal',
        title: 'withResetFromSignal resets values and flags when the signal changes',
        run: ({ formGroup, flush }) => {
            const source = signal<{ name: string; age: number } | null>(null);
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control(''), age: control(0) }))
                .withResetFromSignal(source);
            flush();
            const steps: unknown[] = [fg.value];
            source.set({ name: 'Lara', age: 30 });
            flush();
            steps.push(fg.value);
            fg.controls.name.setValue('edited');
            fg.controls.name.markAsDirty();
            steps.push({ dirty: fg.dirty });
            source.set({ name: 'Indy', age: 40 });
            flush();
            steps.push({ value: fg.value, dirty: fg.dirty });
            return steps;
        },
    },
    {
        id: 'reset-from-signal-factory',
        title: 'formGroup.withResetFromSignal factory with nullable definition',
        run: ({ formGroup, flush }) => {
            const source = signal<{ first: string; last: string } | null>(null);
            const fg = formGroup.withResetFromSignal(source, { first: { nullable: true }, last: { nullable: true } });
            flush();
            const a = fg.value;
            source.set({ first: 'A', last: 'B' });
            flush();
            return { a, b: fg.value };
        },
    },
    {
        id: 'value-change-effect',
        title: 'withValueChangeEffect: only fires when read values change and the form is dirty',
        run: ({ formGroup, flush }) => {
            const calls: unknown[] = [];
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ name: control(''), other: control('') }))
                .withValueChangeEffect(({ name }: any) => calls.push(name));
            flush();
            const initial = calls.length;
            fg.controls.name.setValue('x');
            flush();
            const notDirty = calls.length;
            fg.controls.name.markAsDirty();
            flush();
            fg.controls.name.setValue('y');
            flush();
            fg.controls.other.setValue('unrelated');
            flush();
            return { initial, notDirty, calls: [...calls] };
        },
    },
    {
        id: 'with-effect',
        title: 'withEffect receives the form and tracks its signals',
        run: ({ formGroup, flush }) => {
            const seen: unknown[] = [];
            const fg = formGroup
                .withBuilder(({ control }: any) => ({ a: control('') }))
                .withValidation({ a: [Validators.required] })
                .withEffect((form: any) => seen.push(form.validSignal()));
            flush();
            fg.controls.a.setValue('x');
            flush();
            return seen;
        },
    },
    {
        id: 'dynamic-definition',
        title: 'definition function reading a signal adds, updates and retires controls',
        run: ({ formGroup, flush }) => {
            const def = signal<any>({ name: { value: 'Lara Croft' } });
            const fg = formGroup.withBuilder(() => def());
            const steps: unknown[] = [{ keys: Object.keys(fg.controls), value: fg.value }];
            def.set({ name: { value: 'Indiana Jones' }, age: { value: 40 } });
            flush();
            steps.push({ keys: Object.keys(fg.controls), value: fg.value });
            def.set({ age: { value: 50 } });
            flush();
            steps.push({ keys: Object.keys(fg.controls), value: fg.value });
            return steps;
        },
    },
    {
        id: 'with-type',
        title: 'withType: definition satisfying a class',
        run: ({ formGroup }) => {
            class Dto {
                name = '';
                nick: string | null = null;
            }
            const fg = formGroup.withType(Dto, { name: { nullable: false, value: 'x' }, nick: null });
            fg.controls.nick.setValue('n');
            const a = fg.value;
            fg.reset();
            return { a, b: fg.value };
        },
    },
    {
        id: 'disabled-definition',
        title: 'control defined as disabled',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ a: control({ value: 'a', disabled: true }), b: control('b') }));
            return { a: fg.controls.a.disabled, value: fg.value, raw: fg.getRawValue() };
        },
    },
    {
        id: 'set-errors-manual',
        title: 'manually set errors make the control invalid until the value changes',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ a: control('x') }));
            fg.controls.a.setErrors({ server: 'nope' });
            const a = { errors: fg.controls.a.errors, valid: fg.valid };
            fg.controls.a.setValue('y');
            return { a, b: { errors: fg.controls.a.errors, valid: fg.valid } };
        },
    },
    {
        id: 'set-value-missing-key',
        title: 'setValue on a group requires all controls',
        run: ({ formGroup }) => {
            const fg = formGroup.withBuilder(({ control }: any) => ({ a: control('a'), b: control('b') }));
            let error = '';
            try {
                fg.setValue({ a: 'only' });
            } catch (e: any) {
                error = String(e.message).includes('Must supply a value') ? 'must-supply' : e.message;
            }
            return { error, value: fg.value };
        },
    },
];
