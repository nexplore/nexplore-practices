import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { randomAsyncValidator } from '../../stories/util';
import { PuibeFormFieldComponent } from '../form-field/form-field.component';
import { PuibeInputDirective } from '../input/input.directive';
import { PuibeLabelDirective } from '../form-field/label.directive';
import { PuibeDateInputDirective } from './date-input.directive';
import { PuibeCalendarFlyoutComponent } from './calendar/calendar-flyout.component';
import { add, format } from 'date-fns';
import { CalendarPeriodType } from './services/calendar-period.service';
import { PuibeMonthInputDirective } from './month-input.directive';
import { PuibeYearInputDirective } from './year-input.directive';
import { PuibeReadonlyDirective } from '../common/readonly.directive';

type Args = {
    label: string;
    value: 'none' | string | Date;
    calendarInitialDate: 'none' | string | Date;
    required?: boolean;
    customRangeValidator?: { min: Date; max: Date };
    asyncValidator?: boolean;
    disabled?: boolean;
    disableCalendar?: boolean;
    disableCalendarKeyboardActivation?: boolean;
    min?: Date;
    max?: Date;
    calendarAllowedViewModes?: CalendarPeriodType[];
    type?: CalendarPeriodType;
    calendarViewMode?: CalendarPeriodType;
    calendarHideWeekLabels?: boolean;
    calendarHideTodayButton?: boolean;
    endOfMonth?: boolean;
    readonly?: boolean;
    readonlyEmptyValuePlaceholder?: string;
};

function extractDateFromArgs(args: Args) {
    if (args.value !== 'none') {
        return args.value;
    }
    return undefined;
}

function getDateString(dateStr: string | Date): any {
    return !dateStr || dateStr === 'none' ? null : "'" + dateStr + "'";
}

const customValidator =
    (range: { min: Date; max: Date }) =>
    (control: AbstractControl): ValidationErrors | null => {
        if (control.value && (control.value < range.min || control.value > range.max)) {
            return { customDateRange: true };
        }

        return null;
    };

const meta: Meta<Args> = {
    title: 'PUIBE/date-input',
    component: PuibeFormFieldComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        value: {
            type: { name: 'enum', value: ['01.12.2020', '8.2.23', '01.01.25', 'none'] },
            defaultValue: 'none',
        },
        calendarInitialDate: {
            type: { name: 'enum', value: ['01.12.2020', '8.2.23', '01.01.25', 'none'] },
            defaultValue: 'none',
        },
        calendarAllowedViewModes: {
            type: {
                name: 'array',
                value: {
                    name: 'enum',
                    value: ['date', 'month', 'year'],
                },
            },
            defaultValue: ['date', 'month', 'year'],
        },
        type: {
            type: { name: 'enum', value: ['date', 'month', 'year'] },
            defaultValue: 'date',
        },
        endOfMonth: { type: 'boolean', defaultValue: false, description: 'Only for month-input' },
        calendarViewMode: {
            type: { name: 'enum', value: ['date', 'month', 'year'] },
            defaultValue: 'date',
        },
        min: {
            type: {
                name: 'enum',
                value: [
                    format(add(new Date(), { days: -10 }), 'dd.MM.yyyy'),
                    format(add(new Date(), { days: 2 }), 'dd.MM.yyyy'),
                    '01.12.2020',
                    '8.2.23',
                    '01.01.25',
                    'none',
                ],
            },
            defaultValue: 'none',
        },
        max: {
            type: {
                name: 'enum',
                value: [
                    format(add(new Date(), { days: 10 }), 'dd.MM.yyyy'),
                    '01.12.2020',
                    '8.2.23',
                    '01.01.25',
                    'none',
                ],
            },
            defaultValue: 'none',
        },

        disableCalendarKeyboardActivation: { type: 'boolean', defaultValue: false },
        disableCalendar: { type: 'boolean', defaultValue: false },

        required: { type: 'boolean', defaultValue: false },
        asyncValidator: { type: 'boolean', defaultValue: false },
        disabled: { type: 'boolean', defaultValue: false },
        calendarHideWeekLabels: { type: 'boolean', defaultValue: false },
        calendarHideTodayButton: { type: 'boolean', defaultValue: false },
        readonly: { type: 'boolean', defaultValue: false },
        readonlyEmptyValuePlaceholder: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeFormFieldComponent,
                PuibeInputDirective,
                PuibeLabelDirective,

                PuibeDateInputDirective,
                PuibeMonthInputDirective,
                PuibeYearInputDirective,
                PuibeCalendarFlyoutComponent,
                PuibeReadonlyDirective,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            formGroup: new FormGroup({
                value: new FormControl(
                    { value: extractDateFromArgs(args), disabled: args.disabled },
                    [
                        ...(args.required ? [Validators.required] : []),
                        ...(args.customRangeValidator ? [customValidator(args.customRangeValidator)] : []),
                    ],
                    args.asyncValidator ? [randomAsyncValidator] : []
                ),
            }),
        },
        template: `
        <puibe-form-field class="w-1/2 max-sm:w-full" [formGroup]="formGroup" [puibeReadonly]="readonly" 
            ${
                args.readonlyEmptyValuePlaceholder
                    ? `[readonlyEmptyValuePlaceholder]="readonlyEmptyValuePlaceholder"`
                    : ''
            }
            >
            <label puibeLabel>${args.label}</label>
            <input puibeInput type="${args.type ?? 'date'}" 
                   ${args.type === 'month' ? '[endOfMonth]="endOfMonth"' : ''}
                   [disableCalendar]="${args.disableCalendar}" 
                   [disableCalendarKeyboardActivation]="${args.disableCalendarKeyboardActivation}" 
                   [calendarAllowedViewModes]="calendarAllowedViewModes"                   
                   [calendarViewMode]="calendarViewMode"
                   [calendarInitialDate]="${getDateString(args.calendarInitialDate)}"
                   [min]="min"
                   [max]="max"
                   [calendarHideWeekLabels]="${args.calendarHideWeekLabels}"
                   [calendarHideTodayButton]="${args.calendarHideTodayButton}"
                   formControlName="value"  />
        </puibe-form-field>

        <p>Form actual value: <code>{{formGroup.controls.value.value ?? 'null'}}</code></p>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { label: 'date-input' },
};

export const Month: Story = {
    args: { label: 'month-input', type: 'month' },
};
export const Year: Story = {
    args: { label: 'year-input', type: 'year' },
};

export const Birthdate: Story = {
    args: { label: 'Enter birthdate', type: 'date', calendarViewMode: 'year' },
};

export const WithInitialStringValue: Story = {
    args: { label: 'date-input', value: '12.12.1993' },
};

export const WithCalendarInitialDate: Story = {
    args: { label: 'date-input', calendarInitialDate: '12.12.1993' },
};

export const WithCalendarInitialMonth: Story = {
    args: { label: 'date-input', calendarViewMode: 'month', calendarInitialDate: '1993' },
};

export const WithCalendarInitialYear: Story = {
    args: { label: 'date-input', calendarViewMode: 'year', calendarInitialDate: '1993' },
};

export const WithInitialDateValue: Story = {
    args: { label: 'date-input', value: new Date() },
};

export const RequiredInput: Story = {
    args: { label: 'required date-input', required: true },
};

export const MinMaxInput: Story = {
    args: { label: 'min/max date-input', min: add(new Date(), { weeks: -3 }), max: add(new Date(), { days: 4 }) },
};

export const CustomRangeValidator: Story = {
    args: {
        label: 'min/max date-input',
        customRangeValidator: { min: add(new Date(), { weeks: -3 }), max: add(new Date(), { days: 4 }) },
    },
};

export const CustomRangeValidatorPlusMinMax: Story = {
    args: {
        label: 'min/max date-input',
        min: add(new Date(), { weeks: -3 }),
        max: add(new Date(), { days: 4 }),
        customRangeValidator: { min: add(new Date(), { weeks: -2 }), max: add(new Date(), { days: 2 }) },
    },
};

export const MinMaxMonth: Story = {
    args: {
        label: 'min/max month-input',
        type: 'month',
        min: add(new Date(), { months: -3 }),
        max: add(new Date(), { months: 4 }),
    },
};

export const MinMaxYear: Story = {
    args: {
        label: 'min/max year-input',
        type: 'year',
        min: add(new Date(), { years: -3 }),
        max: add(new Date(), { years: 4 }),
    },
};

export const DisabledInput: Story = {
    args: { label: 'disabled date-input', disabled: true },
};

export const AsyncValidator: Story = {
    args: { label: 'async date-input', asyncValidator: true },
};

export const DisableCalendar: Story = {
    args: { label: 'disableCalendar', disableCalendar: true },
};

export const DisableCalendarKeyboardActivation: Story = {
    args: { label: 'disableCalendarKeyboardActivation', disableCalendarKeyboardActivation: true },
};

export const WithNgModel: Story = {
    render: (args) => ({
        props: {
            ...args,

            modelValue: new Date(),
            changedValue: null,
            modelChange: function (value: Date) {
                console.log('model change', value);
                this.changedValue = value;
            },
        },
        template: `
        <puibe-form-field class="w-1/2 max-sm:w-full">
            <label puibeLabel>With ngModel</label>
            <input puibeInput type="date" [ngModel]="modelValue" (ngModelChange)="modelChange($event)" />
        </puibe-form-field>
        
        <p>Initial: <code>{{modelValue ?? 'null'}}</code></p>
        <p>Current: <code>{{changedValue ?? 'null'}}</code></p>
        `,
    }),
};

export const ReadonlyEmptyValuePlaceholder: Story = {
    args: { label: 'readonlyEmptyValuePlaceholder', readonly: true, readonlyEmptyValuePlaceholder: 'Custom value' },
};

export const MonthEndOfMonth: Story = {
    args: { label: 'month-input', value: new Date(), type: 'month', endOfMonth: true },
};

export const MonthEndOfMonthReadonly: Story = {
    args: { label: 'month-input', value: new Date(), type: 'month', endOfMonth: true, readonly: true },
};
