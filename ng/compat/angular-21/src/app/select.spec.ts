import { Component, Type } from '@angular/core';
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
import { IQueryParamsWithFilter } from '@nexplore/practices-ui';
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
// (writing input signals, ngOnChanges for items, itemsList, typeahead), with the lowest supported ng-select version.
const hostImports = [
    ReactiveFormsModule,
    NgSelectModule,
    PuibeFormFieldComponent,
    PuibeLabelDirective,
    PuibeSelectDirective,
    PuibeSelectViewSourceDirective,
];
const hostTemplate = `
    <puibe-form-field [formGroup]="form">
        <label puibeLabel>Food</label>
        <ng-select puibeInput [puibeSelectViewSource]="source" formControlName="value" />
    </puibe-form-field>
`;

@Component({ imports: hostImports, template: hostTemplate })
class SelectHost {
    readonly source = new SelectViewSource<Item>({ label: 'name', value: 'id', searchable: false }, () =>
        of({ data: items, total: items.length })
    );
    readonly form = new FormGroup({ value: new FormControl<number | null>(2) });
}

// Remote search: the view source sets the typeahead of the ng-select and filters by the search term.
@Component({ imports: hostImports, template: hostTemplate })
class RemoteSearchHost {
    readonly searchTerms: (string | null | undefined)[] = [];
    readonly source = new SelectViewSource<Item>(
        { label: 'name', value: 'id' },
        (params: IQueryParamsWithFilter<Item>) => {
            const term = params.filter?.name;
            this.searchTerms.push(term);
            const data = items.filter((item) => !term || item.name.includes(term));
            return of({ data, total: data.length });
        }
    );
    readonly form = new FormGroup({ value: new FormControl<number | null>(null) });
}

async function render<T>(host: Type<T>): Promise<{ fixture: ComponentFixture<T>; ngSelect: NgSelectComponent }> {
    TestBed.configureTestingModule({
        imports: [host],
        providers: [provideTranslateService(), providePracticesKtbe()],
    });
    const fixture = TestBed.createComponent(host);
    await settle(fixture);
    const ngSelect = fixture.debugElement.query(By.directive(NgSelectComponent)).injector.get(NgSelectComponent);
    return { fixture, ngSelect };
}

// The view source debounces its loads by 300 ms, and whenStable does not wait for that timer.
async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 350));
    await fixture.whenStable();
    fixture.detectChanges();
}

describe('practices-ui-ktbe select with ng-select 21', () => {
    let fixture: ComponentFixture<SelectHost>;
    let ngSelect: NgSelectComponent;

    beforeEach(async () => {
        ({ fixture, ngSelect } = await render(SelectHost));
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

describe('practices-ui-ktbe select with remote search and ng-select 21', () => {
    let fixture: ComponentFixture<RemoteSearchHost>;
    let ngSelect: NgSelectComponent;

    beforeEach(async () => {
        ({ fixture, ngSelect } = await render(RemoteSearchHost));
    });

    it('loads the items filtered by the search term', async () => {
        ngSelect.filter('Rac');
        await settle(fixture);

        expect(fixture.componentInstance.searchTerms.at(-1)).toBe('Rac');
        expect(ngSelect.itemsList.items.map((item) => item.label)).toEqual(['Raclette']);
    });

    // Documents a difference to ng-select 24: ng-select 21 also emits the typeahead (null) when an item is selected
    // (and on close and clear), so the view source loads once more without filter. See MigrationGuides.md.
    it('reloads the items without filter after an item is selected', async () => {
        ngSelect.filter('Rac');
        await settle(fixture);
        const loadsBeforeSelect = fixture.componentInstance.searchTerms.length;
        ngSelect.select(ngSelect.itemsList.items[0]);
        await settle(fixture);

        expect(fixture.componentInstance.form.value.value).toBe(2);
        expect(fixture.componentInstance.searchTerms.length).toBe(loadsBeforeSelect + 1);
        expect(fixture.componentInstance.searchTerms.at(-1)).toBeNull();
        expect(ngSelect.itemsList.items.map((item) => item.label)).toEqual(['Pizza', 'Raclette', 'Fondue']);
    });
});
