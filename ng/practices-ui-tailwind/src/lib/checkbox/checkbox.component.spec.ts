import 'jest-preset-angular/setup-env/zone';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { createEnvironmentInjector, ElementRef, runInInjectionContext } from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { PuiFormFieldService } from '@nexplore/practices-ng-forms';
import { FORM_CONFIG } from '../form/form.config';
import { PuiCheckboxComponent } from './checkbox.component';

function createCheckbox(control: FormControl<boolean | null> | null = new FormControl(false)) {
    const injector = createEnvironmentInjector([
        { provide: ElementRef, useValue: new ElementRef(document.createElement('input')) },
        {
            provide: PuiFormFieldService,
            useValue: {
                isRequired$: of(false),
                registerNgControl: () => undefined,
            },
        },
        { provide: FORM_CONFIG, useValue: { hideInvalidIfUntouched: true } },
    ], null as never);

    const checkbox = runInInjectionContext(injector, () => new PuiCheckboxComponent());
    const ngControl = {
        control,
        get touched() {
            return control?.touched ?? false;
        },
        get status() {
            return control?.status ?? 'VALID';
        },
        get value() {
            return control?.value;
        },
        get errors() {
            return control?.errors;
        },
        valueChanges: control?.valueChanges ?? null,
        statusChanges: control?.statusChanges ?? null,
    } as unknown as NgControl;

    (checkbox as unknown as { _ngControlSubject: BehaviorSubject<NgControl | null> })._ngControlSubject.next(ngControl);

    return { checkbox, control };
}

const waitForDelayedNgControl = () => new Promise((resolve) => setTimeout(resolve));

describe('PuiCheckboxComponent', () => {
    beforeEach(() => undefined);

    it('emits false for an initially untouched control', async () => {
        const { checkbox } = createCheckbox();
        const touchedStates: boolean[] = [];

        const subscription = checkbox.touched$.subscribe((touched) => touchedStates.push(touched));
        await waitForDelayedNgControl();

        expect(touchedStates).toEqual([false]);
        subscription.unsubscribe();
    });

    it('emits true for a control that is already touched when attached', async () => {
        const control = new FormControl(false);
        control.markAsTouched();
        const { checkbox } = createCheckbox(control);
        const touchedStates: boolean[] = [];

        const subscription = checkbox.touched$.subscribe((touched) => touchedStates.push(touched));
        await waitForDelayedNgControl();

        expect(touchedStates).toEqual([true]);
        subscription.unsubscribe();
    });

    it('emits true when markAsTouched changes the control touched state', async () => {
        const { checkbox, control } = createCheckbox();
        const touchedStates: boolean[] = [];
        const subscription = checkbox.touched$.subscribe((touched) => touchedStates.push(touched));
        await waitForDelayedNgControl();

        control?.markAsTouched();

        expect(touchedStates).toEqual([false, true]);
        subscription.unsubscribe();
    });

    it('emits false when markAsUntouched changes the control touched state back', async () => {
        const control = new FormControl(false);
        control.markAsTouched();
        const { checkbox } = createCheckbox(control);
        const touchedStates: boolean[] = [];
        const subscription = checkbox.touched$.subscribe((touched) => touchedStates.push(touched));
        await waitForDelayedNgControl();

        control.markAsUntouched();

        expect(touchedStates).toEqual([true, false]);
        subscription.unsubscribe();
    });

    it('handles a temporarily missing control safely', async () => {
        const { checkbox } = createCheckbox(null);
        const touchedStates: boolean[] = [];

        const subscription = checkbox.touched$.subscribe((touched) => touchedStates.push(touched));
        await waitForDelayedNgControl();

        expect(touchedStates).toEqual([false]);
        subscription.unsubscribe();
    });

    it('shows an initially touched invalid checkbox when invalid display is hidden until touched', async () => {
        const control = new FormControl(false, { validators: Validators.requiredTrue });
        control.markAsTouched();
        const { checkbox } = createCheckbox(control);
        const displayAsInvalidStates: boolean[] = [];

        const subscription = checkbox.displayAsInvalid$.subscribe((displayAsInvalid) =>
            displayAsInvalidStates.push(displayAsInvalid),
        );
        await waitForDelayedNgControl();

        expect(displayAsInvalidStates).toContain(true);
        subscription.unsubscribe();
    });
});
