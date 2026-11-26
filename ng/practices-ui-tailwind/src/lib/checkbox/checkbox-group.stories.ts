import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { randomAsyncValidator } from '../../stories/util';
import { PuiCheckboxGroupComponent } from './checkbox-group.component';
import { PuiCheckboxComponent } from './checkbox.component';

type Args = {
    legend: string;
    gapVariant?: 'default' | 'large';
    hint?: string;
    displayInline?: boolean;
    hideGroupBorder?: boolean;
    hideOptional?: boolean;
    legendAsLabel?: boolean;
    checkboxes: {
        label: string;
        description?: string;
        defaultValue?: boolean;
        required?: boolean;
        disabled?: boolean;
        asyncValidator?: boolean;
    }[];
    readonly?: boolean;
    readonlyEmptyValuePlaceholder?: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/checkbox-group',
    component: PuiCheckboxGroupComponent,
    tags: ['autodocs'],
    argTypes: {
        legend: { type: 'string' },
        hint: { type: 'string' },
        displayInline: { type: 'boolean', defaultValue: false },
        hideGroupBorder: { type: 'boolean', defaultValue: false },
        hideOptional: { type: 'boolean', defaultValue: false },
        legendAsLabel: { type: 'boolean', defaultValue: false },
        checkboxes: {
            type: {
                name: 'array',
                value: {
                    name: 'object',
                    value: {
                        label: { name: 'string' },
                        defaultValue: { name: 'boolean' },
                        required: { name: 'boolean' },
                        disabled: { name: 'boolean' },
                        asyncValidator: { name: 'boolean' },
                    },
                },
            },
        },
        readonly: { type: 'boolean', defaultValue: false },
        readonlyEmptyValuePlaceholder: { type: 'string' },
    },
    decorators: [moduleMetadata({ imports: [PuiCheckboxGroupComponent, PuiCheckboxComponent, PuiReadonlyDirective] })],
    render: (args) => {
        const formGroup = new FormGroup({});
        args.checkboxes.forEach((c, i) =>
            formGroup.addControl(
                `checkbox-${i}`,
                new FormControl(
                    { value: c.defaultValue, disabled: c.disabled },
                    c.required ? [Validators.requiredTrue] : [],
                    c.asyncValidator ? [randomAsyncValidator] : [],
                ),
            ),
        );

        return {
            props: {
                ...args,
                formGroup: formGroup,
            },
            template: `
        <div [formGroup]="formGroup" class="w-full" [puiReadonly]="readonly">
            <pui-checkbox-group class="w-full" [legend]="legend" [hint]="hint" [displayInline]="displayInline" [hideGroupBorder]="hideGroupBorder" [gapVariant]="gapVariant" [hideOptional]="hideOptional" [legendAsLabel]="legendAsLabel" [readonlyEmptyValuePlaceholder]="readonlyEmptyValuePlaceholder">
                <pui-checkbox *ngFor="let checkbox of checkboxes; index as i" [label]="checkbox.label" [description]="checkbox.description" formControlName="{{'checkbox' + '-' + i}}"></pui-checkbox>
            </pui-checkbox-group>
        </div>`,
        };
    },
};

export default meta;

type Story = StoryObj<Args>;

export const CheckboxGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            {
                label: 'Option 2 mit Zusatz Text',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            { label: 'Option 3', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            {
                label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            { label: 'Option 5', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 6', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 7', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 8', defaultValue: null, required: false, disabled: false, asyncValidator: false },
        ],
    },
};

export const CheckboxGroupWithHint: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: 'Das ist hier ein weiterer optionaler Hinweistext!',
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            {
                label: 'Option 2 mit Zusatz Text',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            { label: 'Option 3', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            {
                label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            { label: 'Option 5', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 6', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 7', defaultValue: null, required: false, disabled: false, asyncValidator: false },
            { label: 'Option 8', defaultValue: null, required: false, disabled: false, asyncValidator: false },
        ],
    },
};

export const DefaultValueRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1' },
            { label: 'Option 2 mit Zusatz Text' },
            { label: 'Option 3' },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { label: 'Option 5', defaultValue: true },
            { label: 'Option 6' },
            { label: 'Option 7' },
            { label: 'Option 8' },
        ],
    },
};

export const RequiredRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', required: true },
            { label: 'Option 2 mit Zusatz Text', required: true },
            { label: 'Option 3', required: true },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang', required: true },
            { label: 'Option 5', required: true },
            { label: 'Option 6', required: true },
            { label: 'Option 7', required: true },
            { label: 'Option 8', required: true },
        ],
    },
};

export const DisabledRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', disabled: true },
            { label: 'Option 2 mit Zusatz Text', disabled: true },
            { label: 'Option 3', disabled: true },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang', disabled: true },
            { label: 'Option 5', disabled: true },
            { label: 'Option 6', disabled: true },
            { label: 'Option 7', disabled: true },
            { label: 'Option 8', disabled: true },
        ],
    },
};

export const DisabledWithDefaultValueRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', disabled: true },
            { label: 'Option 2 mit Zusatz Text', disabled: true },
            { label: 'Option 3', disabled: true, defaultValue: true },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang', disabled: true },
            { label: 'Option 5', disabled: true },
            { label: 'Option 6', disabled: true },
            { label: 'Option 7', disabled: true },
            { label: 'Option 8', disabled: true },
        ],
    },
};

export const InlineRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: true,
        checkboxes: [
            { label: 'Option 1' },
            { label: 'Option 2 mit Zusatz Text' },
            { label: 'Option 3' },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang' },
            { label: 'Option 5' },
            { label: 'Option 6' },
            { label: 'Option 7' },
            { label: 'Option 8' },
        ],
    },
};

export const AsyncValidatorRadioButtonGroup: Story = {
    args: {
        legend: 'Optionaler Hinweistext:',
        hint: null,
        displayInline: false,
        checkboxes: [
            { label: 'Option 1', asyncValidator: true },
            { label: 'Option 2 mit Zusatz Text', asyncValidator: true },
            { label: 'Option 3', asyncValidator: true },
            { label: 'Option 4 ist wirklich seeeeehr seeeeehr seeeeehr aber wirklich sehr lang', asyncValidator: true },
            { label: 'Option 5', asyncValidator: true },
            { label: 'Option 6', asyncValidator: true },
            { label: 'Option 7', asyncValidator: true },
            { label: 'Option 8', asyncValidator: true },
        ],
    },
};

export const CheckboxGroupWithDescriptions: Story = {
    args: {
        legend: 'Label',
        gapVariant: 'large',
        hint: null,
        displayInline: false,
        checkboxes: [
            {
                label: 'Option 1',
                description: 'Beschreibungstext aus den Stammdaten',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            {
                label: 'Option 2 mit Zusatz Text',
                description: 'Beschreibungstext aus den Stammdaten',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
            {
                label: 'Option 3',
                description: 'Beschreibungstext aus den Stammdaten',
                defaultValue: null,
                required: false,
                disabled: false,
                asyncValidator: false,
            },
        ],
    },
};

export const CheckboxGroupWithHiddenOptional: Story = {
    args: {
        hideOptional: true,
        displayInline: false,
        checkboxes: [
            { label: 'Nicht-Required 1', required: false },
            { label: 'Nicht-Required 2', required: false },
            { label: 'Nicht-Required 3', required: false },
            { label: 'Nicht-Required 4', required: false },
        ],
    },
};

export const CheckboxGroupWithLegendAsLabel: Story = {
    args: {
        legend: 'Legend Content',
        hint: null,
        displayInline: false,
        legendAsLabel: true,
        checkboxes: [
            { label: 'Required-Option 1', required: true },
            { label: 'Option 2', required: false },
            { label: 'Option 3', required: false },
            { label: 'Option 4', required: false },
        ],
    },
};

export const ReadonlyCheckboxGroup: Story = {
    args: {
        legend: 'Readonly Content',
        readonly: true,
        checkboxes: [
            { label: 'Option 1', required: false },
            { label: 'Option 2', required: false },
            { label: 'Option 3', required: false },
            { label: 'Option 4', required: false },
        ],
    },
};

export const ReadonlyEmptyValuePlaceholderCheckboxGroup: Story = {
    args: {
        legend: 'Readonly Content',
        readonly: true,
        readonlyEmptyValuePlaceholder: 'Custom Placeholder',
        checkboxes: [
            { label: 'Option 1', required: false },
            { label: 'Option 2', required: false },
            { label: 'Option 3', required: false },
            { label: 'Option 4', required: false },
        ],
    },
};

