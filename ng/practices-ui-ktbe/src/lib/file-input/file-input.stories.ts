import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { randomAsyncValidator } from '../../stories/util';
import { PuibeFormFieldComponent } from './../form-field/form-field.component';
import { PuibeFileInputDirective } from './file-input.directive';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { PuibeInputDirective } from '../input/input.directive';
import { PuibeNoticeDirective } from '../form-field/notice.directive';
import { PuibeReadonlyDirective } from '../common/readonly.directive';

type Args = {
    label: string;
    labelAlwaysVisible: boolean;
    placeholder: string;
    value: string;
    required?: boolean;
    asyncValidator?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    notice: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/file-input',
    component: PuibeFormFieldComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        labelAlwaysVisible: { type: 'boolean', defaultValue: false },
        placeholder: { type: 'string' },
        value: {
            type: { name: 'enum', value: ['hallo.pdf', null] },
            defaultValue: null,
        },
        required: { type: 'boolean', defaultValue: false },
        asyncValidator: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        readonly: { type: 'boolean', defaultValue: false },
        notice: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeFormFieldComponent,
                PuibeNoticeDirective,
                PuibeInputDirective,
                PuibeFileInputDirective,
                PuibeLabelDirective,
                PuibeReadonlyDirective,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            formGroup: new FormGroup({
                value: new FormControl<File | null>(
                    {
                        value: args.value ? new File([], args.value) : null,
                        disabled: args.disabled,
                    },
                    args.required ? [Validators.required] : [],
                    args.asyncValidator ? [randomAsyncValidator] : []
                ),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2" [formGroup]="formGroup" [puibeReadonly]="readonly">
            ${args.label ? '<label puibeLabel alwaysVisible="{{labelAlwaysVisible}}">{{label}}</label>' : ''}
            <input puibeInput type="file"
                   formControlName="value"
                   [placeholder]="placeholder"/>
            ${args.notice ? '<p puibeNotice>{{notice}}</p>' : ''}
        </puibe-form-field>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { label: 'Default' },
};

export const WithNoticeInput: Story = {
    args: { label: 'With Notice Input', notice: 'Only Pdf' },
};

export const WithCustomPlaceholder: Story = {
    args: { label: 'With Custom Placeholder', placeholder: 'I am unique' },
};

export const RequiredInput: Story = {
    args: { label: 'Required Input', required: true },
};

export const DisabledInput: Story = {
    args: { label: 'Disabled Input', disabled: true },
};

export const ReadonlyInput: Story = {
    args: { label: 'Readonly Input', readonly: true, value: 'hallo.pdf' },
};

export const AsyncValidatorInput: Story = {
    args: { label: 'Async Validator Input', asyncValidator: true },
};
