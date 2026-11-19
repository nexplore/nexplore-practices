import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePractices } from '@nexplore/practices-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PuibeReadonlyDirective } from '../common/readonly.directive';
import { PuibeFormFieldComponent } from '../form-field/form-field.component';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { SelectViewSource } from './select-view-source';
import { PuibeSelectViewSourceDirective } from './select-view-source.directive';
import { PuibeSelectDirective } from './select.directive';

interface Item {
    id: number;
    name: string;
}

const items: Item[] = [
    { id: 1, name: 'Pizza' },
    { id: 2, name: 'Hamburger' },
];

@Component({
    imports: [
        ReactiveFormsModule,
        NgSelectModule,
        PuibeFormFieldComponent,
        PuibeLabelDirective,
        PuibeSelectDirective,
        PuibeSelectViewSourceDirective,
        PuibeReadonlyDirective,
    ],
    template: `
        <puibe-form-field [formGroup]="formGroup" [puibeReadonly]="readonly">
            <label puibeLabel>Food</label>
            <ng-select
                puibeInput
                [puibeSelectViewSource]="itemSource"
                bindLabel="name"
                bindValue="id"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>
    `,
})
class HostComponent {
    readonly = true;
    itemSource = new SelectViewSource<Item>(null, () => of({ data: items, total: items.length }));
    formGroup = new FormGroup({ value: new FormControl<number | null>(1) });
}

describe('PuibeSelectViewSourceDirective', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideTranslateService(), provideNoopAnimations(), providePractices()],
        });
    });

    it('shows the label of the selected item in readonly mode once the items are loaded', async () => {
        const fixture = TestBed.createComponent(HostComponent);

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const readonlyValue = fixture.nativeElement.querySelector('puibe-readonly-label-value') as HTMLElement;
        expect(readonlyValue.textContent).toContain('Pizza');
    });
});
