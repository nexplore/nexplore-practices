import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { PuiDirtyGuardService } from '@nexplore/practices-ng-dirty-guard';
import { PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { formGroup } from '../form-group-fluent-builder/api';
import { providePuiSignalFormsStatusClasses } from '../form-state/provide-signal-forms-config';
import { PuiValidators } from '../validation/validators';
import { PuiFormFieldControlDirective } from './form-field-control.directive';
import { PuiFormFieldDirective } from './form-field.directive';
import { PuiFormFieldService } from './form-field.service';
import { providePuiFormFieldConfig } from './form-field.provider';
import { PuiFormDirective } from './form.directive';
import { removeValidatorsOnReadonlyFieldsBehavior } from './remove-validators-on-readonly-fields.behavior';
import { firstValueFrom, take, toArray } from 'rxjs';

const createForm = () =>
    formGroup
        .withBuilder(({ control }) => ({ name: control('', { nonNullable: true }), other: control('o') }))
        .withValidation({ name: [PuiValidators.minLength(2), Validators.required] });

@Component({
    selector: 'test-host',
    imports: [FormField, PuiFormFieldDirective, PuiFormFieldControlDirective, PuiFormDirective, PuiReadonlyDirective],
    template: `
        <form [formGroup]="form" puiForm [enableDirtyFormNavigationGuard]="guard()">
            <div puiFormField [puiReadonly]="readonly()">
                <input id="name" [formField]="form.controls.name.field" />
            </div>
            <input id="other" [formField]="form.controls.other.field" />
        </form>
    `,
})
class HostComponent {
    readonly form = createForm();
    readonly guard = signal(false);
    readonly readonly = signal(false);
}

describe('signal forms form field directives', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let nameInput: HTMLInputElement;

    const service = () => fixture.debugElement.query((d) => d.attributes['puiFormField'] !== undefined).injector.get(PuiFormFieldService);
    const settle = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                providePuiSignalFormsStatusClasses(),
                providePuiFormFieldConfig({ behaviors: [removeValidatorsOnReadonlyFieldsBehavior()] }),
            ],
        });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        nameInput = fixture.nativeElement.querySelector('#name');
        await settle();
    });

    it('registers the [formField] with the surrounding puiFormField service', () => {
        expect(service().stateSignal()).toBe(host.form.controls.name.fieldState);
        expect(service().statusSignal()).toBe('INVALID');
        expect(service().requiredSignal()).toBe(true);
    });

    it('exposes value, status, dirty, touched, errors and required as signals and observables', async () => {
        const s = service();
        expect(s.valueSignal()).toBe('');
        expect(s.errorsSignal()).toEqual({ required: true }); // Angular's minLength ignores empty values

        const statuses = firstValueFrom(s.status$.pipe(take(2), toArray()));
        nameInput.value = 'ab';
        nameInput.dispatchEvent(new Event('input'));
        await settle();
        expect(host.form.controls.name.value).toBe('ab');
        expect(s.valueSignal()).toBe('ab');
        expect(s.statusSignal()).toBe('VALID');
        expect(s.dirtySignal()).toBe(true);
        expect(s.errorsSignal()).toBeNull();
        expect(await statuses).toEqual(['INVALID', 'VALID']);

        expect(s.touchedSignal()).toBe(false);
        nameInput.dispatchEvent(new Event('blur'));
        await settle();
        expect(s.touchedSignal()).toBe(true);
        expect(await firstValueFrom(s.dirty$)).toBe(true);
        expect(await firstValueFrom(s.touched$)).toBe(true);
        expect(await firstValueFrom(s.invalid$)).toBe(false);
        expect(await firstValueFrom(s.errors$)).toBeNull();
    });

    it('hides errors of untouched fields when configured', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ providers: [providePuiFormFieldConfig({ hideInvalidIfUntouched: true })] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
        expect(service().statusSignal()).toBe('INVALID');
        expect(service().displayAsInvalidSignal()).toBe(false);
        expect(service().errorsSignal()).toBeNull();
        host.form.controls.name.setValue('a');
        service().markAsTouched();
        expect(service().displayAsInvalidSignal()).toBe(true);
        await settle();
        expect(await firstValueFrom(service().errorsTranslationKeys$)).toEqual([
            { key: 'Messages.Validation_Minlength', param: { requiredLength: 2, actualLength: 1 } },
        ]);
    });

    it('adds the status classes to the control element when configured', async () => {
        expect(nameInput.classList).toContain('ng-invalid');
        expect(nameInput.classList).toContain('ng-pristine');
        nameInput.value = 'ab';
        nameInput.dispatchEvent(new Event('input'));
        await settle();
        expect(nameInput.classList).toContain('ng-valid');
        expect(nameInput.classList).toContain('ng-dirty');
    });

    it('the form directive marks all controls and form fields as touched, and reads validity and dirtiness from the form', async () => {
        const directive = fixture.debugElement.query((d) => d.attributes['puiForm'] !== undefined).injector.get(PuiFormDirective);
        expect(directive.getIfAllRenderedControlsAreValid()).toBe(false);
        expect(directive.getIfAllRenderedControlsArePristine()).toBe(true);
        directive.markAsTouched();
        await settle();
        expect(host.form.controls.other.touched).toBe(true);
        expect(service().touchedSignal()).toBe(true);
        host.form.controls.other.markAsDirty();
        expect(directive.canDeactivate(null)).toBe(false);
        host.form.markAsPristine();
        expect(directive.canDeactivate(null)).toBe(true);
    });

    it('activates the dirty guard only when enabled', async () => {
        const activate = jest.fn();
        const deactivate = jest.fn();
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [{ provide: PuiDirtyGuardService, useValue: { activateComponent: activate, deactivateComponent: deactivate } }],
        });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
        expect(activate).not.toHaveBeenCalled();
        host.guard.set(true);
        await settle();
        expect(activate).toHaveBeenCalled();
        host.guard.set(false);
        await settle();
        expect(deactivate).toHaveBeenCalled();
    });

    it('readonly directive makes the field readonly, so it is not validated, and restores it', async () => {
        expect(host.form.controls.name.valid).toBe(false);
        host.readonly.set(true);
        await settle();
        expect(host.form.controls.name.readonly).toBe(true);
        expect(host.form.controls.name.valid).toBe(true);
        expect(nameInput.readOnly).toBe(true);
        host.readonly.set(false);
        await settle();
        expect(host.form.controls.name.readonly).toBe(false);
        expect(host.form.controls.name.valid).toBe(false);
    });

    it('sets placeholder, id, loading, clearable and overlay text without a form binding', async () => {
        const s = service();
        s.setLabelAsPlaceholder('Label');
        s.setLoading(true);
        s.setClearable(true);
        s.setOverlayText({ text: 'overlay' });
        s.setAriaDescription('desc');
        expect(await firstValueFrom(s.placeholder$)).toBe('Label');
        expect(await firstValueFrom(s.loading$)).toBe(true);
        expect(await firstValueFrom(s.clearable$)).toBe(true);
        expect(await firstValueFrom(s.overlayText$)).toEqual({ text: 'overlay' });
        expect(await firstValueFrom(s.ariaDescription$)).toBe('desc');
        expect(await firstValueFrom(s.pending$)).toBe(true);
    });

    it('shows the readonly value of the field', async () => {
        host.form.controls.name.setValue('abc');
        await settle();
        expect(await firstValueFrom(service().readonlyValue$)).toBe('abc');
        service().setReadonlyValueFunction(() => 'custom');
    });
});
