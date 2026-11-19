import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePractices } from '@nexplore/practices-ui';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { provideTranslateService } from '@ngx-translate/core';
import { PuibeFormFieldComponent } from '../form-field/form-field.component';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { PuibeSelectDirective } from './select.directive';

@Component({
    imports: [ReactiveFormsModule, NgSelectModule, PuibeFormFieldComponent, PuibeLabelDirective, PuibeSelectDirective],
    template: `
        <puibe-form-field [formGroup]="formGroup">
            <label puibeLabel>Food</label>
            <ng-select puibeInput [items]="items" [panelClass]="panelClass" formControlName="value"></ng-select>
        </puibe-form-field>
    `,
})
class HostComponent {
    readonly ngSelect = viewChild.required(NgSelectComponent);
    items = ['Pizza', 'Pasta'];
    panelClass: unknown = { 'my-panel': true };
    formGroup = new FormGroup({ value: new FormControl<string | null>(null, Validators.required) });
}

describe('PuibeSelectDirective', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideTranslateService(), provideNoopAnimations(), providePractices()],
        });
    });

    async function render() {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        return fixture;
    }

    const panelClasses = (host: HostComponent) => host.ngSelect().panelClasses().split(' ').filter(Boolean).sort();

    it('keeps the panelClass of the application, also as object', async () => {
        const fixture = await render();

        expect(panelClasses(fixture.componentInstance)).toContain('my-panel');
        expect(panelClasses(fixture.componentInstance).join(' ')).not.toContain('object');
    });

    it('follows changes of a bound panelClass', async () => {
        const fixture = await render();

        fixture.componentInstance.panelClass = 'other-panel';
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(panelClasses(fixture.componentInstance)).toContain('other-panel');
        expect(panelClasses(fixture.componentInstance)).not.toContain('my-panel');
    });

    it('adds the invalid state to the panel when the select is displayed as invalid', async () => {
        const fixture = await render();

        fixture.componentInstance.formGroup.controls.value.markAsTouched();
        fixture.componentInstance.formGroup.controls.value.updateValueAndValidity();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(panelClasses(fixture.componentInstance)).toEqual(
            expect.arrayContaining(['my-panel', 'puibe-select-panel-invalid'])
        );
    });
});
