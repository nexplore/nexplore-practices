import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeReadonlyDirective } from '../../index';
import { randomAsyncValidator } from '../../stories/util';
import { PuibeCalendarFlyoutComponent } from '../date-input/calendar/calendar-flyout.component';
import { PuibeDateInputDirective } from '../date-input/date-input.directive';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { PuibeNoticeDirective } from '../form-field/notice.directive';
import { PuibeFormFieldComponent } from './../form-field/form-field.component';
import { PuibeInputDirective } from './input.directive';

type Args = {
    value?: string | number;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    notice?: string;
    placeholder?: string;
    inputType?: 'text' | 'number' | 'date' | 'textarea' | 'file';
    asyncValidator?: boolean;
    labelAlwaysVisible?: boolean;
    labelHideOptional?: boolean;
    useValueFormatter?: boolean;
    readonly?: boolean;
    useSmallTextForReadonlyLabel?: boolean;
    readonlyEmptyValuePlaceholder?: string;
};

const SVNrFormatter = (input: string): string => {
    // check if correct dot was entered.
    if (/^\d{3}\.$/m.test(input) || /^\d{3}\.\d{4}\.$/m.test(input) || /^\d{3}\.\d{4}\.\d{4}\.$/m.test(input)) {
        return input;
    }

    // Format value automatically.
    const pattern = 'xxx.xxxx.xxxx.xx';
    const inputNumbersOnly = input.replace(/\D+/g, '');
    let pos = 0;
    let newValue = '';
    pattern.split('.').forEach((subpattern) => {
        if (pos + subpattern.length < inputNumbersOnly.length) {
            newValue = newValue + inputNumbersOnly.substring(pos, pos + subpattern.length) + '.';
            pos += subpattern.length;
        } else if (pos < inputNumbersOnly.length) {
            newValue = newValue + inputNumbersOnly.substring(pos);
            pos = inputNumbersOnly.length;
        }
    });

    return newValue.substring(0, pattern.length);
};

const meta: Meta<Args> = {
    title: 'PUIBE/input',
    component: PuibeFormFieldComponent,
    tags: ['autodocs'],
    argTypes: {
        value: { type: 'string' },
        label: { type: 'string' },
        required: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        notice: { type: 'string' },
        placeholder: { type: 'string' },
        inputType: { type: { name: 'enum', value: ['text', 'number', 'date'] }, defaultValue: 'text' },
        asyncValidator: { type: 'boolean', defaultValue: false },
        labelAlwaysVisible: { type: 'boolean', defaultValue: false },
        labelHideOptional: { type: 'boolean', defaultValue: false },
        useValueFormatter: { type: 'boolean', defaultValue: false },
        readonly: { type: 'boolean', defaultValue: false },
        useSmallTextForReadonlyLabel: { type: 'boolean', defaultValue: false },
        readonlyEmptyValuePlaceholder: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeFormFieldComponent,
                PuibeInputDirective,
                PuibeLabelDirective,
                PuibeNoticeDirective,
                PuibeReadonlyDirective,

                PuibeDateInputDirective,
                PuibeCalendarFlyoutComponent,
            ],
        }),
    ],
    render: (args) => {
        const input = `
            <puibe-form-field [hideOptional]="${args.labelHideOptional}" 
                ${
                    args.readonlyEmptyValuePlaceholder
                        ? `[readonlyEmptyValuePlaceholder]="readonlyEmptyValuePlaceholder"`
                        : ''
                }
                [useSmallTextForReadonlyLabel]="useSmallTextForReadonlyLabel" [puibeReadonly]="readonly" class="w-1/2" [formGroup]="formGroup">
                <label puibeLabel [alwaysVisible]="${args.labelAlwaysVisible}">${args.label}</label>
                <input puibeInput type="${args.inputType}" 
                    ${args.placeholder ? `[placeholder]="placeholder"` : ''}
                    formControlName="value" 
                    [valueFormatter]="valueFormatter" />
                ${args.notice ? '<p puibeNotice>{{notice}}</p>' : ''}
            </puibe-form-field>`;

        const textarea = `
            <puibe-form-field [hideOptional]="${args.labelHideOptional}" 
                ${
                    args.readonlyEmptyValuePlaceholder
                        ? `[readonlyEmptyValuePlaceholder]="readonlyEmptyValuePlaceholder"`
                        : ''
                }
                [useSmallTextForReadonlyLabel]="useSmallTextForReadonlyLabel" [puibeReadonly]="readonly" class="w-1/2" [formGroup]="formGroup">
                <label puibeLabel [alwaysVisible]="${args.labelAlwaysVisible}">${args.label}</label>
                <textarea puibeInput
                    ${args.placeholder ? `[placeholder]="placeholder"` : ''}
                    formControlName="value">
                </textarea>
                ${args.notice ? '<p puibeNotice>{{notice}}</p>' : ''}
            </puibe-form-field>`;

        return {
            props: {
                ...args,
                formGroup: new FormGroup({
                    value: new FormControl(
                        { value: args.value, disabled: args.disabled },
                        args.required ? [Validators.required] : [],
                        args.asyncValidator ? [randomAsyncValidator] : []
                    ),
                }),
                valueFormatter: args.useValueFormatter ? SVNrFormatter : undefined,
            },
            template: args.inputType === 'textarea' ? textarea : input,
        };
    },
};

export default meta;

type Story = StoryObj<Args>;

export const TextInput: Story = {
    args: {
        label: 'Basic Text-Input',
        required: false,
        inputType: 'text',
    },
};
export const TextInputWithDifferentPlaceholder: Story = {
    args: {
        label: 'Basic Text-Input',
        placeholder: 'With different placeholder',
        required: false,
        inputType: 'text',
    },
};

export const TextInputWithNoPlaceholder: Story = {
    args: {
        label: 'Basic Text-Input',

        placeholder: null,
        required: false,
        inputType: 'text',
    },
};
export const TextInputWithNotice: Story = {
    args: {
        label: 'Basic Text-Input',
        required: false,
        notice: 'Hinweis-Text zu diesem Input',
        inputType: 'text',
    },
};

export const TextInputWithVisibleLabel: Story = {
    args: {
        label: 'Basic Text-Input',
        required: false,
        inputType: 'text',
        labelAlwaysVisible: true,
    },
};

export const TextInputWithVisibleLabelAndDifferentPlaceholder: Story = {
    args: {
        label: 'Basic Text-Input',
        placeholder: 'Different placheolder',
        required: false,
        inputType: 'text',
        labelAlwaysVisible: true,
    },
};

export const TextInputWithHiddenOptional: Story = {
    args: {
        label: 'Basic Text-Input',
        required: false,
        inputType: 'text',
        labelHideOptional: true,
    },
};

export const TextInputWithSVNrFormatter: Story = {
    args: {
        label: 'SV Nr',
        required: false,
        inputType: 'text',
        labelHideOptional: true,
        useValueFormatter: true,
    },
};

export const RequiredInput: Story = {
    args: {
        value: null,
        label: 'Required Input',
        required: true,
        inputType: 'number',
    },
};

export const NumberInput: Story = {
    args: {
        value: 3,
        label: 'Basic Number-Input',
        required: false,
        inputType: 'number',
    },
};

export const DateInput: Story = {
    args: {
        label: 'Basic Date-Input',
        required: false,
        inputType: 'date',
    },
};

export const DisabledInput: Story = {
    args: {
        value: null,
        label: 'Disabled Input',
        disabled: true,
    },
};

export const ReadonlyInput: Story = {
    args: {
        value: null,
        label: 'Disabled Input',
        readonly: true,
    },
};

export const ReadonlyInputWithValue: Story = {
    args: {
        value: 'Etwas Text',
        label: 'Readonly Input',
        readonly: true,
    },
};

export const AsyncValidator: Story = {
    args: {
        value: null,
        label: 'Async Validated Input',
        asyncValidator: true,
    },
};

export const ReadonlyInputWithCustomEmptyPlaceholder: Story = {
    args: {
        label: 'Custom No Entry Value Input',
        inputType: 'number',
        readonly: true,
        readonlyEmptyValuePlaceholder: 'Custom Value',
    },
};

export const Textarea: Story = {
    args: {
        label: 'Basic Text-Area',
        required: false,
        inputType: 'textarea',
    },
};

export const TextareaWithVisibleLabel: Story = {
    args: {
        label: 'Basic Text-Area',
        required: false,
        inputType: 'textarea',
        labelAlwaysVisible: true,
    },
};

export const TextareaWithHiddenOptional: Story = {
    args: {
        label: 'Basic Text-Area',
        required: false,
        inputType: 'textarea',
        labelHideOptional: true,
    },
};

export const RequiredTextarea: Story = {
    args: {
        label: 'Basic Text-Area',
        required: true,
        inputType: 'textarea',
    },
};

export const DisabledTextarea: Story = {
    args: {
        label: 'Basic Text-Area',
        disabled: true,
        value: 'Hello World',
        inputType: 'textarea',
    },
};

export const ReadonlyTextarea: Story = {
    args: {
        label: 'Basic Text-Area',
        disabled: true,
        value: 'Hello World',
        inputType: 'textarea',
        readonly: true,
    },
};

export const ReadonlyTextareaWithCustomEmptyPlaceholder: Story = {
    args: {
        label: 'Custom Readonly No Entry Value Text-Area',
        inputType: 'textarea',
        readonly: true,
        readonlyEmptyValuePlaceholder: 'Custom Value',
    },
};
