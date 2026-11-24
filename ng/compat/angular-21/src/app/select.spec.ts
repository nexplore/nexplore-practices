import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import {
    providePracticesKtbe,
    PuibeFormFieldComponent,
    PuibeLabelDirective,
    PuibeSelectDirective,
    PuibeSelectViewSourceDirective,
    SelectViewSource,
} from '@nexplore/practices-ui-ktbe';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

interface Item {
    id: number;
    name: string;
}

const items: Item[] = [
    { id: 1, name: 'Pizza' },
    { id: 2, name: 'Raclette' },
    { id: 3, name: 'Fondue' },
];

// Runtime check of the ng-select internals that PuibeSelectDirective and PuibeSelectViewSourceDirective rely on
// (writing input signals, ngOnChanges for items, itemsList), with the lowest supported ng-select version.
@Component({
    imports: [
        ReactiveFormsModule,
        NgSelectModule,
        PuibeFormFieldComponent,
        PuibeLabelDirective,
        PuibeSelectDirective,
        PuibeSelectViewSourceDirective,
    ],
    template: `
        <puibe-form-field [formGroup]="form">
            <label puibeLabel>Food</label>
            <ng-select puibeInput [puibeSelectViewSource]="source" formControlName="value" />
        </puibe-form-field>
    `,
})
class SelectHost {
    readonly source = new SelectViewSource<Item>({ label: 'name', value: 'id', searchable: false }, () =>
        of({ data: items, total: items.length })
    );
    readonly form = new FormGroup({ value: new FormControl<number | null>(2) });
}

describe('practices-ui-ktbe select with ng-select 21', () => {
    let fixture: ComponentFixture<SelectHost>;
    let ngSelect: NgSelectComponent;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [SelectHost],
            providers: [provideTranslateService(), providePracticesKtbe()],
        });
        fixture = TestBed.createComponent(SelectHost);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        ngSelect = fixture.debugElement.query(By.directive(NgSelectComponent)).injector.get(NgSelectComponent);
    });

    it('loads the items of the view source', () => {
        expect(ngSelect.itemsList.items.map((item) => item.label)).toEqual(['Pizza', 'Raclette', 'Fondue']);
    });

    it('writes the view source config to the ng-select inputs', () => {
        expect(ngSelect.bindLabel()).toBe('name');
        expect(ngSelect.bindValue()).toBe('id');
        expect(ngSelect.searchable()).toBe(false);
        expect(ngSelect.labelForId()).toBeTruthy();
    });

    it('displays the label of the selected value', () => {
        const label = fixture.nativeElement.querySelector('.ng-value-label') as HTMLElement | null;
        expect(label?.textContent?.trim()).toBe('Raclette');
    });

    it('updates the form control when an item is selected', () => {
        ngSelect.select(ngSelect.itemsList.items[2]);
        expect(fixture.componentInstance.form.value.value).toBe(3);
    });
});
