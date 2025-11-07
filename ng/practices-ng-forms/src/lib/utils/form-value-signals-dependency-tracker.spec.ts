import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from '@jest/globals';
import { createFormValueSignalsProxyWithAutoTrackingDependencies } from './create-form-value-signals-proxy-with-auto-tracking-dependencies';

describe('createFormValueSignalsProxyWithAutoTrackingDependencies', () => {
    it('should return a proxy that tracks dependencies', () => {
        const results: Array<boolean | null> = [];
        TestBed.runInInjectionContext(() => {
            const form = new FormGroup({
                testControl: new FormControl<null | boolean>(false),
            });

            const values = createFormValueSignalsProxyWithAutoTrackingDependencies(form);

            effect(() => {
                const value = values.testControl;

                results.push(value);
            });

            TestBed.tick();

            form.controls.testControl.setValue(true);

            TestBed.tick();

            form.controls.testControl.setValue(false);

            TestBed.tick();
        });

        expect(results).toEqual([false, true, false]);
    });

    it('should not track control values that are not read', () => {
        const results: Array<boolean | null> = [];
        TestBed.runInInjectionContext(() => {
            const form = new FormGroup({
                aTracked: new FormControl<null | boolean>(false),
                bUntracked: new FormControl<null | boolean>(false),
                cUntracked: new FormControl<null | boolean>(false),
                dTracked: new FormControl<null | boolean>(false),
            });

            const values = createFormValueSignalsProxyWithAutoTrackingDependencies(form);

            effect(() => {
                const a = values.aTracked;
                const d = values.dTracked;

                results.push(a && d);
            });

            form.controls.aTracked.setValue(true);
            TestBed.tick();

            form.controls.bUntracked.setValue(true);
            TestBed.tick();

            form.controls.cUntracked.setValue(true);
            TestBed.tick();

            form.controls.dTracked.setValue(true);
            TestBed.tick();
        });

        expect(results).toEqual([false, true]);
    });

    it('should track when controls are iterated dynamically and keys change', () => {
        const results: Array<any> = [];
        TestBed.runInInjectionContext(() => {
            const form = new FormGroup<any>({
                a: new FormControl<null | boolean>(false),
            });

            const proxy = createFormValueSignalsProxyWithAutoTrackingDependencies(form);

            effect(() => {
                const entries = Object.entries(proxy);
                results.push(entries);
            });

            TestBed.tick();

            form.addControl('b', new FormControl<null | boolean>(false));
            TestBed.tick();

            form.addControl('c', new FormControl<null | boolean>(false));
            TestBed.tick();

            form.removeControl('b');
            TestBed.tick();
        });

        expect(results).toEqual([
            [['a', false]],
            [
                ['a', false],
                ['b', false],
            ],
            [
                ['a', false],
                ['b', false],
                ['c', false],
            ],
            [
                ['a', false],
                ['c', false],
            ],
        ]);
    });

    // TODO: Add tests for debouncing
});

