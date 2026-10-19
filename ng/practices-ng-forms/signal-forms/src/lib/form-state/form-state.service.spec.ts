import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { PuiGlobalRouteGuardService } from '@nexplore/practices-ng-dirty-guard';
import { PuiFormularInvalidError } from '@nexplore/practices-ng-forms';
import { formGroup } from '../form-group-fluent-builder/api';
import { markAllAsTouched } from '../utils/mark-all-as-touched';
import { combineDirectiveControlErrors } from '../utils/combine-directive-control-errors';
import {
    formControlCurrentValueSignal,
    formGroupCurrentValueMappedSignal,
    formGroupCurrentValueSignal,
    formGroupValueChangesSignal,
} from '../utils/form-signal-utils';
import { PuiFormStateService } from './form-state.service';

describe('PuiFormStateService with signal forms', () => {
    let service: PuiFormStateService;
    let guard: PuiGlobalRouteGuardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PuiFormStateService);
        guard = TestBed.inject(PuiGlobalRouteGuardService);
    });

    const build = () =>
        TestBed.runInInjectionContext(() =>
            formGroup
                .withBuilder(({ control }) => ({ a: control('') }))
                .withValidation({ a: [Validators.required] })
        );

    it('throws PuiFormularInvalidError for an invalid form and touches all fields afterwards', async () => {
        jest.useFakeTimers();
        try {
            const fg = build();
            await expect(service.runWithFormValidityCheck(fg, () => 'saved')).rejects.toBeInstanceOf(PuiFormularInvalidError);
            jest.advanceTimersByTime(250);
            expect(fg.controls.a.touched).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    it('runs the function for a dirty and valid form and disables the guard while it runs', async () => {
        const fg = build();
        fg.controls.a.setValue('x');
        fg.controls.a.markAsDirty();
        let disabledDuring: boolean | undefined;
        const result = await service.runWithFormValidityCheck(fg, () => {
            disabledDuring = guard.disabled;
            return 42;
        });
        expect(result).toBe(42);
        expect(disabledDuring).toBe(true);
        expect(guard.disabled).toBe(false);
    });

    it('runWithoutDirtyGuard restores the previous state for sync, promise and throwing functions', async () => {
        expect(service.runWithoutDirtyGuard(() => guard.disabled)).toBe(true);
        expect(guard.disabled).toBe(false);
        await service.runWithoutDirtyGuard(async () => expect(guard.disabled).toBe(true));
        expect(guard.disabled).toBe(false);
        expect(() =>
            service.runWithoutDirtyGuard(() => {
                throw new Error('x');
            })
        ).toThrow('x');
        expect(guard.disabled).toBe(false);
    });
});

describe('signal form utils', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('markAllAsTouched, combineDirectiveControlErrors', () =>
        TestBed.runInInjectionContext(() => {
            const fg = formGroup
                .withBuilder(({ control, group, array }) => ({
                    a: control('', [Validators.required]),
                    g: group({ b: control('', [Validators.required, Validators.email]) }),
                    items: array([control('', [Validators.required])]),
                }))
                .withValidation({});
            markAllAsTouched(fg);
            expect(fg.controls.g.controls.b.touched).toBe(true);
            expect(fg.controls.items.at(0)!.touched).toBe(true);
            expect(combineDirectiveControlErrors(fg.controls.a)).toEqual({ required: true });
            expect(combineDirectiveControlErrors(fg.controls.g)).toEqual({ required: true });
            expect(combineDirectiveControlErrors(fg.controls.items)).toEqual({ required: true });
            fg.controls.a.setValue('x');
            fg.controls.g.controls.b.setValue('x@y.ch');
            fg.controls.items.at(0)!.setValue('i');
            expect(combineDirectiveControlErrors(fg)).toBeNull();
        }));

    it('current value signals', () =>
        TestBed.runInInjectionContext(() => {
            const fg = formGroup.withBuilder(({ control }) => ({ a: control('a'), b: control('b') }));
            const full = formGroupCurrentValueSignal(fg);
            const mapped = formGroupCurrentValueMappedSignal(fg, { controlNames: ['a'], map: (v) => v.a });
            const whileDirty = formGroupValueChangesSignal(fg, { initialValue: { a: 'initial' } });
            const control = formControlCurrentValueSignal(fg.controls.a);
            expect(full()).toEqual({ a: 'a', b: 'b' });
            expect(mapped()).toBe('a');
            expect(whileDirty()).toEqual({ a: 'initial' });
            fg.controls.a.setValue('x');
            expect(full()).toEqual({ a: 'x', b: 'b' });
            expect(mapped()).toBe('x');
            expect(control()).toBe('x');
            expect(whileDirty()).toEqual({ a: 'initial' });
            fg.controls.a.markAsDirty();
            expect(whileDirty()).toEqual({ a: 'x', b: 'b' });
        }));
});
