import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeReadonlyDirective } from '../../index';
import { randomAsyncValidator } from '../../stories/util';
import { PuibeRadioButtonGroupComponent } from './radio-button-group.component';
import { PuibeRadioButtonComponent } from './radio-button.component';

type Args = {
    legend: string;
    name?: string;
    hint?: string;
    values?: { id: number; name: string; description?: string }[];
    defaultValue?: string | number;
    required?: boolean;
    disabled?: boolean;
    displayInline?: boolean;
    hideGroupBorders?: boolean;
    hideOptional?: boolean;
    legendAsLabel?: boolean;
    gapVariant?: 'default' | 'large';
    asyncValidator?: boolean;
    readonly?: boolean;
    useSmallTextForReadonlyLabel?: boolean;
    readonlyEmptyValuePlaceholder?: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/radio-button-group',
    component: PuibeRadioButtonGroupComponent,
    tags: ['autodocs'],
    argTypes: {
        legend: { type: 'string' },
        name: { type: 'string' },
        hint: { type: 'string' },
        values: {
            type: {
                name: 'array',
                value: { name: 'object', value: { id: { name: 'string' }, name: { name: 'string' } } },
            },
        },
        defaultValue: { type: 'string' },
        required: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        displayInline: { type: 'boolean', defaultValue: false },
        hideGroupBorders: { type: 'boolean', defaultValue: false },
        hideOptional: { type: 'boolean', defaultValue: false },
        legendAsLabel: { type: 'boolean', defaultValue: false },
        asyncValidator: { type: 'boolean', defaultValue: false },
        readonly: { type: 'boolean', defaultValue: false },
        useSmallTextForReadonlyLabel: { type: 'boolean', defaultValue: false },
        readonlyEmptyValuePlaceholder: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuibeRadioButtonGroupComponent, PuibeRadioButtonComponent, PuibeReadonlyDirective],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            formGroup: new FormGroup({
                radio: new FormControl(
                    { value: args.defaultValue, disabled: args.disabled },
                    args.required ? [Validators.required] : [],
                    args.asyncValidator ? [randomAsyncValidator] : []
                ),
            }),
        },
        template: `
        <div [formGroup]="formGroup" class="w-full"  [puibeReadonly]="readonly">
            <puibe-radio-button-group class="w-full" [useSmallTextForReadonlyLabel]="useSmallTextForReadonlyLabel" [legend]="legend" [attr.name]="name" [hint]="hint" formControlName="radio" [displayInline]="displayInline" [hideGroupBorders]="hideGroupBorders" [gapVariant]="gapVariant" [hideOptional]="hideOptional" [legendAsLabel]="legendAsLabel" [readonlyEmptyValuePlaceholder]="readonlyEmptyValuePlaceholder">
                <puibe-radio-button [value]="value.id" [label]="value.name" [description]="value.description" *ngFor="let value of values; index as i"></puibe-radio-button>
            </puibe-radio-button-group>
        </div>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const RadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
    },
};

export const RadioButtonGroupWithHint: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: 'Das ist hier ein weiterer optionaler Hinweistext!',
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
    },
};

export const DefaultValueRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: 5,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
    },
};

export const RequiredRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: true,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
    },
};

export const DisabledRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: true,
        displayInline: false,
        asyncValidator: false,
    },
};

export const DisabledWithDefaultValueRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: 3,
        required: false,
        disabled: true,
        displayInline: false,
        asyncValidator: false,
    },
};

export const InlineRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: true,
        asyncValidator: false,
    },
};

export const AsyncValidatorRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: true,
    },
};

export const RadioButtonGroupWithDescription: Story = {
    args: {
        legend: 'Label',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1', description: 'Beschreibungstext aus den Stammdaten' },
            { id: 2, name: 'Option 2 mit Zusatz Text', description: 'Beschreibungstext aus den Stammdaten' },
            { id: 3, name: 'Option 3', description: 'Beschreibungstext aus den Stammdaten' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: false,
        gapVariant: 'large',
        asyncValidator: false,
    },
};

export const RadioButtonGroupWithHiddenOptional: Story = {
    args: {
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4' },
        ],
        defaultValue: null,
        required: false,
        hideOptional: true,
        displayInline: false,
    },
};

export const RadioButtonGroupWithLegendAsLabel: Story = {
    args: {
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4' },
        ],
        defaultValue: null,
        required: true,
        hideOptional: true,
        displayInline: false,
        legend: 'Legend Content',
        legendAsLabel: true,
    },
};

export const ReadonlyRadioButtonGroupNoValue: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: null,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
        readonly: true,
    },
};

export const ReadonlyRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        defaultValue: 3,
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
        readonly: true,
    },
};

export const ReadonlyEmptyValuePlaceholderRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        name: null,
        hint: null,
        values: [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2 mit Zusatz Text' },
            { id: 3, name: 'Option 3' },
            { id: 4, name: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { id: 5, name: 'Option 5' },
            { id: 6, name: 'Option 6' },
            { id: 7, name: 'Option 7' },
            { id: 8, name: 'Option 8' },
        ],
        required: false,
        disabled: false,
        displayInline: false,
        asyncValidator: false,
        readonly: true,
        readonlyEmptyValuePlaceholder: 'Custom Placeholder',
    },
};
