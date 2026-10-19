import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { formGroup as reactiveFormGroup } from '@nexplore/practices-ng-forms';
import { formGroup as signalFormGroup } from '../src/index';
import { recordParity } from './parity-report';

const build = (formGroup: any) =>
    formGroup
        .withBuilder(({ control }: any) => ({ name: control('initial'), age: control(1) }))
        .withValidation({ name: [Validators.required] });

@Component({
    selector: 'test-reactive-host',
    imports: [ReactiveFormsModule],
    template: `<input id="name" [formControl]="form.controls.name" /><input id="age" type="number" [formControl]="form.controls.age" />`,
})
class ReactiveHostComponent {
    readonly form = build(reactiveFormGroup);
}

@Component({
    selector: 'test-signal-host',
    imports: [FormField],
    template: `<input id="name" [formField]="form.controls.name.field" /><input id="age" type="number" [formField]="form.controls.age.field" />`,
})
class SignalHostComponent {
    readonly form = build(signalFormGroup);
}

async function drive(fixture: ComponentFixture<ReactiveHostComponent | SignalHostComponent>) {
    const form = fixture.componentInstance.form as any;
    const el = fixture.nativeElement as HTMLElement;
    const name = el.querySelector<HTMLInputElement>('#name')!;
    const age = el.querySelector<HTMLInputElement>('#age')!;
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const snap = () => ({
        view: name.value,
        model: form.controls.name.value,
        dirty: form.controls.name.dirty,
        touched: form.controls.name.touched,
        valid: form.controls.name.valid,
        disabled: name.disabled,
    });

    await settle();
    const steps: Record<string, unknown> = { initial: snap() };

    name.value = 'typed';
    name.dispatchEvent(new Event('input'));
    await settle();
    steps['input'] = snap();

    form.controls.name.setValue('from-model');
    await settle();
    steps['modelToView'] = snap();

    name.dispatchEvent(new Event('blur'));
    await settle();
    steps['blur'] = snap();

    name.value = '';
    name.dispatchEvent(new Event('input'));
    await settle();
    steps['cleared'] = snap();

    form.controls.name.disable();
    await settle();
    const { dirty, touched, ...disabledSnapshot } = snap();
    steps['disabled'] = disabledSnapshot;
    const disabledFlags = { dirty, touched };
    form.controls.name.enable();
    await settle();
    steps['enabled'] = snap();

    age.value = '42';
    age.dispatchEvent(new Event('input'));
    await settle();
    steps['number'] = { model: form.controls.age.value, type: typeof form.controls.age.value };

    return JSON.parse(JSON.stringify({ steps, disabledFlags }));
}

describe('template binding parity ([formControl] vs [formField])', () => {
    it('input -> model, model -> view, touched on blur, disabled, number input', async () => {
        TestBed.configureTestingModule({});
        const reactive = await drive(TestBed.createComponent(ReactiveHostComponent));
        TestBed.resetTestingModule();
        const signal = await drive(TestBed.createComponent(SignalHostComponent));

        recordParity({
            id: 'template-binding',
            title: 'template binding: host input -> model, model -> view, touched on blur, disabled, number input',
            reactive: reactive.steps,
            signal: signal.steps,
            parity: 'yes',
        });
        expect(signal.steps).toEqual(reactive.steps);

        recordParity({
            id: 'disabled-dirty-touched',
            title: 'dirty/touched flags of a control that was dirty and touched, then disabled',
            reactive: reactive.disabledFlags,
            signal: signal.disabledFlags,
            parity: 'differs-intentionally',
            note: 'A disabled field of a signal form does not contribute to touched/dirty (and validity); Reactive Forms keeps the flags of disabled controls.',
        });
        expect(reactive.disabledFlags).toEqual({ dirty: true, touched: true });
        expect(signal.disabledFlags).toEqual({ dirty: false, touched: false });
    });
});

