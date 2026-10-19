import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { formGroup } from './api';
import { createFormGroup } from './create-form-group';
import { createFormGroupWithResetFromSignal } from './create-form-group-with-reset-from-signal';
import { createFormGroupWithType } from './create-form-group-with-type';

const inContext = <T>(fn: () => T): T => TestBed.runInInjectionContext(fn);

describe('fluent signal form group builder', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('works with all three entry styles and the formGroup namespace', () =>
        inContext(() => {
            class Dto {
                name = '';
                nick: string | null = null;
            }
            const a = createFormGroup({ name: 'a' });
            const b = createFormGroupWithType(Dto, { name: 'b', nick: null });
            const c = createFormGroupWithResetFromSignal(signal<Dto | null>(null), { name: { nullable: true } });
            const d = formGroup.withBuilder(() => ({ name: { value: 'd' } }));
            expect([a.value.name, b.value.name, c.value.name, d.value.name]).toEqual(['a', 'b', null, 'd']);
        }));

    it('uses the provided injector instead of the ambient one', () => {
        const injector = TestBed.inject(Injector);
        const fg = createFormGroup({ name: 'a' }, { injector });
        expect(fg.injector).toBe(injector);
    });

    it('withResetFromSignal supports mapValue and null signal values', () =>
        inContext(() => {
            const source = signal<{ full: string } | null>(null);
            const fg = createFormGroupWithResetFromSignal(
                signal<{ name: string } | null>(null),
                { name: { nullable: true } }
            );
            const mapped = formGroup
                .withBuilder(({ control }) => ({ name: control('') }))
                .withResetFromSignal(source, { mapValue: (dto) => ({ name: dto.full.toUpperCase() }) });
            source.set({ full: 'lara' });
            TestBed.tick();
            expect(mapped.value).toEqual({ name: 'LARA' });
            expect(fg.value.name).toBeNull();
        }));

    it('withResetFromSignal does not re-run when the user edits values', () =>
        inContext(() => {
            const source = signal({ name: 'a' });
            const fg = formGroup.withBuilder(({ control }) => ({ name: control('') })).withResetFromSignal(source);
            TestBed.tick();
            fg.controls.name.setValue('edited');
            TestBed.tick();
            expect(fg.value.name).toBe('edited');
        }));

    it('dynamic definition: keeps user edits when the definition did not change, applies changes otherwise', () =>
        inContext(() => {
            const defaultName = signal('x');
            const fg = formGroup.withBuilder(({ control }) => ({ name: control(defaultName()) }));
            fg.controls.name.setValue('edited');
            TestBed.tick();
            expect(fg.value.name).toBe('edited');
            defaultName.set('y');
            TestBed.tick();
            expect(fg.value.name).toBe('y');
        }));

    it('dynamic definition: disables retired controls and can re-enable them', () =>
        inContext(() => {
            const def = signal<any>({ a: { value: 1 }, b: { value: 2 } });
            const fg = formGroup.withBuilder(() => def());
            TestBed.tick();
            def.set({ a: { value: 1 } });
            TestBed.tick();
            expect(fg.value).toEqual({ a: 1 });
            expect((fg.controls as any).b.disabled).toBe(true);
            def.set({ a: { value: 1 }, b: { value: 3 } });
            TestBed.tick();
            expect(fg.value).toEqual({ a: 1, b: 3 });
        }));

    it('definition functions that throw during creation (e.g. unset required input) recover', () =>
        inContext(() => {
            const input = signal<string | undefined>(undefined);
            const fg = formGroup.withBuilder(() => {
                const v = input();
                if (v === undefined) {
                    throw new Error('required input not set');
                }
                return { name: { value: v } };
            });
            expect(fg.controlNames).toEqual([]);
            input.set('now');
            TestBed.tick();
            expect(fg.value).toEqual({ name: 'now' });
        }));

    it('withEffect accepts an effect function and withValueChangeEffect supports debounce', async () =>
        inContext(async () => {
            jest.useFakeTimers();
            try {
                const calls: unknown[] = [];
                const fg = formGroup
                    .withBuilder(({ control }) => ({ q: control('') }))
                    .withValueChangeEffect(({ q }) => calls.push(q), { debounceTime: 100 });
                fg.controls.q.markAsDirty();
                TestBed.tick();
                fg.controls.q.setValue('a');
                TestBed.tick();
                fg.controls.q.setValue('ab');
                TestBed.tick();
                expect(calls).toEqual([]);
                jest.advanceTimersByTime(150);
                expect(calls).toEqual(['ab']);
            } finally {
                jest.useRealTimers();
            }
        }));

    it('value change effects keep firing after the form became pristine again once it was dirty', () =>
        inContext(() => {
            const calls: unknown[] = [];
            const fg = formGroup
                .withBuilder(({ control }) => ({ q: control('') }))
                .withValueChangeEffect(({ q }) => calls.push(q));
            fg.controls.q.markAsDirty();
            TestBed.tick();
            fg.markAsPristine();
            fg.controls.q.setValue('x');
            TestBed.tick();
            expect(calls).toEqual(['', 'x']);
        }));

    it('definition validators of the short syntax and builder options are applied', () =>
        inContext(() => {
            const fg = createFormGroup({
                a: { value: '', validators: [Validators.required], asyncValidators: [] },
                b: { value: 1, disabled: true },
            });
            expect(fg.controls['a'].errors).toEqual({ required: true });
            expect(fg.controls['b'].disabled).toBe(true);
        }));
});
