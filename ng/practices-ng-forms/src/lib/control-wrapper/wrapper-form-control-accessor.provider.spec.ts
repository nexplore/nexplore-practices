import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { WrapperFormControlAccessor } from './wrapper-form-control-accessor.provider';
import { provideWrappedFormControlAccessors } from './wrapper-form-control-accessor.provider';

const unrelatedSignal = signal(0);

@Component({
    selector: 'pui-test-wrapper',
    template: '',
    providers: [provideWrappedFormControlAccessors(WrapperComponent)],
})
class WrapperComponent implements WrapperFormControlAccessor {
    readonly form = new FormGroup({ name: new FormControl<string | null>(null) });
    readonly dto = signal<{ name: string } | null>(null);

    getValueAccessorWrapperFormControl() {
        return this.form;
    }

    getValueAccessorEntityDtoSignalToAutoResetForm() {
        return this.dto as any;
    }

    writeValue(value: { name: string } | null) {
        // Reading an unrelated signal while the form is reset (e.g. in a validator or value change subscriber)
        unrelatedSignal();
        this.form.reset(value ?? {});
    }
}

@Component({
    imports: [ReactiveFormsModule, WrapperComponent],
    template: '<pui-test-wrapper [formControl]="control" />',
})
class HostComponent {
    readonly control = new FormControl<unknown>(null);
}

describe('provideWrappedFormControlAccessors', () => {
    it('resets the form only when the DTO signal changes, not when a signal read during the reset changes', () => {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const wrapper = fixture.debugElement.children[0].componentInstance as WrapperComponent;

        wrapper.dto.set({ name: 'Initial' });
        TestBed.tick();
        expect(wrapper.form.value.name).toBe('Initial');

        wrapper.form.controls.name.setValue('Edited by the user');
        unrelatedSignal.update((v) => v + 1);
        TestBed.tick();

        expect(wrapper.form.value.name).toBe('Edited by the user');
    });
});
