import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IQueryParamsWithFilter } from '@nexplore/practices-ui';
import { NgSelectModule } from '@ng-select/ng-select';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { BehaviorSubject, concat, debounceTime, map, of, Subject, switchMap, tap, timer } from 'rxjs';
import { randomAsyncValidator } from '../../stories/util';
import { PuibeReadonlyDirective } from '../common/readonly.directive';
import { PuibeFormFieldComponent } from '../form-field/form-field.component';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { FORM_CONFIG } from '../form/form.config';
import { PuibeSelectOptionComponent } from './select-option.component';
import { SelectViewSource } from './select-view-source';
import { PuibeSelectViewSourceDirective } from './select-view-source.directive';
import { PuibeSelectDirective } from './select.directive';

type Args = {
    label: string;
    value: number | null;
    loading: boolean;
    placeholder: string;
    multiple: boolean;
    searchable?: boolean;
    userSearchIconIfSearchable: boolean;
    required?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    asyncValidator?: boolean;
    itemSource?: SelectViewSource<Item>;
    items?: Item[] | unknown[];
};

interface Item {
    id?: number;
    name?: string;
    category?: string;
}

const items = [
    { id: 1, name: 'Pizza', category: 'Fast Food' },
    { id: 2, name: 'Hamburger', category: 'Fast Food' },
    { id: 3, name: 'Chicken Nuggets', category: 'Fast Food' },
    { id: 4, name: 'Bratwurst', category: 'Swiss' },
    { id: 5, name: 'Raclette', category: 'Swiss' },
    { id: 6, name: 'Fondue', category: 'Swiss' },
    { id: 7, name: 'Sushi', category: 'Asian Food\nJapan' },
    { id: 8, name: 'Dim Sum', category: 'Asian Food' },
    { id: 9, name: 'Noodle Soup', category: 'Asian Food' },
];

function defaultLoadFn(params: IQueryParamsWithFilter<Item>) {
    const filteredItems = [...items].filter(
        (i) =>
            !params.filter.name ||
            i.name.includes(params.filter.name) ||
            i.name.toLowerCase().includes(params.filter.name)
    );
    return timer(1000).pipe(map((_) => ({ data: filteredItems, total: filteredItems.length })));
}

const meta: Meta<Args> = {
    title: 'PUIBE/select',
    component: PuibeFormFieldComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        loading: { type: 'boolean', defaultValue: false },
        placeholder: { type: 'string' },
        searchable: { type: 'boolean', defaultValue: true },
        userSearchIconIfSearchable: { type: 'boolean', defaultValue: false },
        multiple: { type: 'boolean', defaultValue: false },
        required: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        asyncValidator: { type: 'boolean', defaultValue: false },
        clearable: { type: 'boolean', defaultValue: true },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeFormFieldComponent,
                PuibeSelectOptionComponent,
                PuibeSelectDirective,
                PuibeSelectViewSourceDirective,
                PuibeLabelDirective,
                NgSelectModule,
                AsyncPipe,
                PuibeReadonlyDirective,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            items: args.items ?? items,
            formGroup: new FormGroup({
                value: new FormControl(
                    { value: args.value, disabled: args.disabled ?? false },
                    args.required ? [Validators.required] : [],
                    args.asyncValidator ? [randomAsyncValidator] : []
                ),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup">
            <label puibeLabel>{{label}}</label>
            <ng-select
                puibeInput
                [items]="items"
                bindLabel="name"
                bindValue="id"
                [placeholder]="placeholder"
                ${args.itemSource ? '[puibeSelectViewSource]="itemSource"' : ''}
                ${args.clearable !== undefined ? '[clearable]="clearable" [clearOnBackspace]="clearable"' : ''}
                ${args.searchable !== undefined ? '[searchable]="searchable"' : ''}
                ${args.userSearchIconIfSearchable ? '[useSearchIconIfSearchable]="userSearchIconIfSearchable"' : ''}
                [multiple]="multiple"
                [loading]="loading"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { label: 'Default' },
};

export const WithInitialValue: Story = {
    args: { label: 'Basic Select with initial value', value: 2 },
};

export const WithInitialNullValue: Story = {
    args: { label: 'Basic Select with initial NULL', items: [{ name: 'None', id: null }, ...items], value: null },
};

export const RequiredSelect: Story = {
    args: { label: 'Required Select', required: true },
};

export const NonClearableSelect: Story = {
    args: { label: 'Non clearable Select', required: true, clearable: false },
};

export const DisabledSelect: Story = {
    args: { label: 'Disabled Select', disabled: true },
};

export const AsyncValidator: Story = {
    args: { label: 'Async Validator Select', asyncValidator: true },
};

export const NonSearchableSelect: Story = {
    args: { label: 'NonSearchable Select', searchable: false },
};

export const WithMetadataSelect: Story = {
    render: (_) => ({
        props: {
            items: items,
            formGroup: new FormGroup({
                value: new FormControl(),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup">
            <label puibeLabel>With Metadata Select</label>
            <ng-select
                puibeInput
                [items]="items"
                bindLabel="name"
                bindValue="id"
                [searchable]="true"
                placeholder="With Metadata Select"
                formControlName="value"
            >
            <ng-template ng-option-tmp let-item="item">
                <puibe-select-option [item]="item" bindMetadata="category" bindLabel="name"></puibe-select-option>
            </ng-template>
            </ng-select>
        </puibe-form-field>`,
    }),
};

export const MultiSelect: Story = {
    args: { label: 'Multi Select', multiple: true },
};

export const MultiSelectRequired: Story = {
    args: { label: 'Multi Select Required', multiple: true, required: true },
};

export const MultiSelectDisabled: Story = {
    args: { label: 'Multi Select Disabled', multiple: true, disabled: true },
};

export const SelectWithViewSource: Story = {
    args: { label: 'Select with ViewSource', itemSource: new SelectViewSource<Item>({}, defaultLoadFn) },
};

export const NonSearchableWithViewSource: Story = {
    args: {
        label: 'NonSearchable Select with ViewSource',
        searchable: false,
        itemSource: new SelectViewSource<Item>({}, defaultLoadFn),
    },
};

export const MultiSelectWithViewSource: Story = {
    args: {
        label: 'Multi Select with ViewSource',
        multiple: true,
        itemSource: new SelectViewSource<Item>({}, defaultLoadFn),
    },
};

export const SelectWithViewSourceConfig: Story = {
    args: {
        label: 'Select with ViewSource',
        itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id' }, defaultLoadFn),
    },
};

export const NonSearchableSelectWithViewSourceConfig: Story = {
    args: {
        label: 'NonSearchable Select with ViewSource',
        itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id', searchable: false }, defaultLoadFn),
    },
};

export const LocalSearchSelectWithViewSource: Story = {
    args: {
        label: 'Local Search Select with ViewSource',
        itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id', localSearch: true }, defaultLoadFn),
    },
};

export const SelectWithViewSourceInitialValue: Story = {
    args: {
        label: 'Select with ViewSource',
        itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id' }, defaultLoadFn),
        value: 2,
    },
};

export const SelectWithViewSourceRequired: Story = {
    args: {
        label: 'Select with ViewSource',
        itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id' }, defaultLoadFn),
        required: true,
    },
};

export const Grouped: Story = {
    render: (_) => ({
        props: {
            itemSource: new SelectViewSource<Item>({ label: 'name', value: 'id' }, defaultLoadFn),
            formGroup: new FormGroup({
                value: new FormControl(),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup">
            <label puibeLabel>Select with ViewSource</label>
            <ng-select
                puibeInput
                [puibeSelectViewSource]="itemSource"
                groupBy="category"
                placeholder="Select with ViewSource"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};

const itemSearchInputSubject = new Subject<string>();
const busySubject = new BehaviorSubject<boolean>(false);
export const AsyncWithoutViewSource: Story = {
    render: (_) => ({
        props: {
            formGroup: new FormGroup({
                value: new FormControl(),
            }),
            itemSearchInputSubject: itemSearchInputSubject,
            busySubject: busySubject,
            asyncItems$: concat(
                of([]),
                itemSearchInputSubject.pipe(
                    debounceTime(300),
                    tap(() => busySubject.next(true)),
                    switchMap((term) =>
                        defaultLoadFn({ filter: { name: term } } as any).pipe(
                            tap(() => busySubject.next(false)),
                            map((res) => res.data)
                        )
                    )
                )
            ),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup">
            <label puibeLabel>Select with ViewSource</label>
            <ng-select
                puibeInput
                [items]="asyncItems$ | async"
                [typeahead]="itemSearchInputSubject"
                [loading]="busySubject | async"
                bindLabel="name"
                bindValue="id"
                placeholder="Select with ViewSource"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};

export const LoadingSpinner: Story = {
    args: { label: 'Loading Spinner', loading: true },
};

export const WithCustomPlaceholder: Story = {
    args: { label: 'With Custom Placeholder', placeholder: 'Search ...' },
};

export const WithDefaultPlaceholder: Story = {
    args: { label: 'With Default Placeholder' },
};

export const UseSearchIcon: Story = {
    args: { label: 'Use Search Icon', userSearchIconIfSearchable: true },
};

export const UseSearchIconDefineInConfig: Story = {
    args: { label: 'Use Search Icon In Config' },
    decorators: [
        moduleMetadata({
            providers: [
                {
                    provide: FORM_CONFIG,
                    useValue: {
                        hideInvalidIfUntouched: false,
                        useSearchIconIfSelectSearchable: true,
                    },
                },
            ],
        }),
    ],
};

export const ReadonlyWithValue: Story = {
    render: (_) => ({
        props: {
            items: items,
            formGroup: new FormGroup({
                value: new FormControl(2),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup" [puibeReadonly]="true">
            <label puibeLabel>Readonly with value</label>
            <ng-select
                puibeInput
                [items]="items"
                bindLabel="name"
                bindValue="id"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};

export const ReadonlyNoValue: Story = {
    render: (_) => ({
        props: {
            items: items,
            formGroup: new FormGroup({
                value: new FormControl(undefined),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup" [puibeReadonly]="true">
            <label puibeLabel>Readonly with no value</label>
            <ng-select
                puibeInput
                [items]="items"
                bindLabel="name"
                bindValue="id"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};
export const ReadonlyMultiSelect: Story = {
    render: (_) => ({
        props: {
            items: items,
            formGroup: new FormGroup({
                value: new FormControl([1, 2, 3]),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup" [puibeReadonly]="true" >
            <label puibeLabel>Readonly multi Select</label>
            <ng-select
                puibeInput
                [items]="items"
                bindLabel="name"
                bindValue="id"
                [multiple]="true"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};

export const SelectWithViewSourceReadonly: Story = {
    render: (_) => ({
        props: {
            itemSource: new SelectViewSource<Item>(null, defaultLoadFn),
            formGroup: new FormGroup({
                value: new FormControl(1),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup" [puibeReadonly]="true">
            <label puibeLabel>Select with ViewSource</label>
            <ng-select
                puibeInput
                [puibeSelectViewSource]="itemSource"
                bindLabel="name"
                bindValue="id"
                placeholder="Select with ViewSource"
                formControlName="value"
            ></ng-select>
        </puibe-form-field>`,
    }),
};
