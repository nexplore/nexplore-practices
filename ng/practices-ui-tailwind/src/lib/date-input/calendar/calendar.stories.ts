import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArgTypes, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiCalendarFlyoutComponent } from './calendar-flyout.component';

import { add, format } from 'date-fns';
import { CalendarPeriodType } from '../services/calendar-period.service';
import { PuiCalendarComponent } from './calendar.component';

type Args = {
    disabled?: boolean;
    hideWeekLabels?: boolean;
    selectedDate: 'none' | string | Date;
    min?: Date;
    max?: Date;
    allowedViewModes?: CalendarPeriodType[];
    viewMode?: 'date' | 'month' | 'year';
    selectionMode?: 'date' | 'week' | 'month' | 'year';
};

const argTypes: Partial<ArgTypes<Args>> = {
    disabled: { type: 'boolean', defaultValue: false },
    allowedViewModes: {
        type: {
            name: 'array',
            value: {
                name: 'enum',
                value: ['date', 'month', 'year'],
            },
        },
        defaultValue: ['date', 'month', 'year'],
    },
    viewMode: {
        type: { name: 'enum', value: ['date', 'month', 'year'] },
        defaultValue: 'date',
    },
    selectionMode: {
        type: { name: 'enum', value: ['date', 'month', 'year'] },
        defaultValue: 'date',
    },
    selectedDate: {
        type: { name: 'enum', value: ['01.12.2020', '8.2.23', '01.01.25', 'none'] },
        defaultValue: 'none',
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
            value: [format(add(new Date(), { days: 10 }), 'dd.MM.yyyy'), '01.12.2020', '8.2.23', '01.01.25', 'none'],
        },
        defaultValue: 'none',
    },
    hideWeekLabels: { type: 'boolean', defaultValue: false },
};

const meta: Meta<Args> = {
    title: 'PUIBE/calendar',
    component: PuiCalendarComponent,
    tags: ['autodocs'],
    argTypes,
    args: Object.fromEntries(
        Object.entries(argTypes)
            .map(([key, t]) => [key, t.defaultValue])
            .filter(([_, v]) => v !== undefined),
    ),
    decorators: [
        moduleMetadata({
            imports: [PuiCalendarFlyoutComponent, PuiCalendarComponent],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-calendar 
            [disabled]="${args.disabled}" 
            viewMode="${args.viewMode ?? 'date'}"
            selectionMode="${args.selectionMode ?? 'date'}"
            [allowedViewModes]="allowedViewModes" 
            selectedDate="${args.selectedDate}" 
            [min]="min"
            [max]="max"
            [hideWeekLabels]="${args.hideWeekLabels}" ></pui-calendar>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: {},
};

export const Month: Story = {
    args: { selectionMode: 'month' },
};

export const Year: Story = {
    args: { selectionMode: 'year' },
};

export const WithFormField: Story = {
    args: {},
    render: (args) => ({
        props: {
            ...args,
            formGroup: new FormGroup({
                value: new FormControl(null, Validators.required),
            }),
        },
        template: `
        <pui-form-field class="w-96" [formGroup]="formGroup">
            <label puiLabel>Datepicker in form field (NOT SUPPORTED YET)</label>
            <pui-calendar 
                [disabled]="${args.disabled}" 
                [min]="min"
                [max]="max"
                formControlName="value" ></pui-calendar>
        </pui-form-field>
       `,
    }),
};

export const WithMinMax: Story = {
    args: { min: add(new Date(), { days: -2 }), max: add(new Date(), { days: 4 }) },
};

export const Flyout: Story = {
    args: {},
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
            <pui-calendar-flyout></pui-calendar-flyout>
       `,
    }),
};

