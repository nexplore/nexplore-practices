import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiReadonlyDirective } from '../../index';
import { randomAsyncValidator } from '../../stories/util';
import { PuiCheckboxGroupComponent } from './checkbox-group.component';
import { PuiCheckboxComponent } from './checkbox.component';

type Args = {
    label?: string;
    description?: string;
    defaultValue?: boolean;
    required?: boolean;
    disabled?: boolean;
    asyncValidator?: boolean;
    readonly?: boolean;
    useSmallTextForReadonlyLabel?: boolean;
    alignLabelStart?: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/checkbox',
    component: PuiCheckboxComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        defaultValue: { type: 'boolean', defaultValue: null },
        required: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        asyncValidator: { type: 'boolean', defaultValue: false },
        readonly: { type: 'boolean', defaultValue: false },
        useSmallTextForReadonlyLabel: { type: 'boolean', defaultValue: false },
        alignLabelStart: { type: 'boolean', defaultValue: false },
    },
    decorators: [moduleMetadata({ imports: [PuiCheckboxComponent, PuiCheckboxGroupComponent, PuiReadonlyDirective] })],
    render: (args) => ({
        props: {
            ...args,
            formGroup: new FormGroup({
                checkbox: new FormControl(
                    { value: args.defaultValue, disabled: args.disabled },
                    args.required ? [Validators.requiredTrue] : [],
                    args.asyncValidator ? [randomAsyncValidator] : [],
                ),
            }),
        },
        template: `
        <div [formGroup]="formGroup" class="w-full">
            <pui-checkbox class="w-full" [label]="label" [puiReadonly]="readonly" [useSmallTextForReadonlyLabel]="useSmallTextForReadonlyLabel" [alignLabelStart]="alignLabelStart" [description]="description" formControlName="checkbox"></pui-checkbox>
        </div>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Checkbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: null,
        required: false,
        disabled: false,
        asyncValidator: false,
    },
};

export const DefaultValueCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: true,
        required: false,
        disabled: false,
        asyncValidator: false,
    },
};

export const RequiredCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: null,
        required: true,
        disabled: false,
        asyncValidator: false,
    },
};

export const DisabledCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: null,
        required: false,
        disabled: true,
        asyncValidator: false,
    },
};

export const AsyncValidatorCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: null,
        required: false,
        disabled: false,
        asyncValidator: true,
    },
};

export const CheckboxWithDescription: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        description: 'Beschreibungstext aus den Stammdaten',
        defaultValue: null,
        required: false,
        disabled: false,
        asyncValidator: false,
    },
};

export const ReadonlyCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: null,
        required: false,
        disabled: false,
        asyncValidator: false,
        readonly: true,
    },
};

export const ReadonlyDefaultValueCheckbox: Story = {
    args: {
        label: 'Ich bin eine Checkbox',
        defaultValue: true,
        required: false,
        disabled: false,
        asyncValidator: false,
        readonly: true,
    },
};

export const AlignLabelStart: Story = {
    args: {
        label: 'Ich bin eine Checkbox mit viel Text, die oben ausgerichtet ist. Wie sieht das wohl aus? Bla bla bla bla, blablabla blablabla lbabal blablabal balbalbblablabla blbabalbalba',
        defaultValue: true,
        required: false,
        disabled: false,
        asyncValidator: false,
    },
};

