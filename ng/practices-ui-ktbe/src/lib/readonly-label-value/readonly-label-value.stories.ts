import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PuibeReadonlyLabelValueComponent } from './readonly-label-value.component';

type Args = {
    label: string;
    value: string;
    useSmallLabel: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/readonly-label-value',
    component: PuibeReadonlyLabelValueComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        value: { type: 'string' },
        useSmallLabel: { type: 'boolean' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuibeReadonlyLabelValueComponent],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `<puibe-readonly-label-value [label]="label" [useSmallLabel]="useSmallLabel">{{ value }}</puibe-readonly-label-value>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { label: 'Vorname', value: 'Anna', useSmallLabel: false },
};

export const SmallLabel: Story = {
    args: { label: 'Vorname', value: 'Anna', useSmallLabel: true },
};

export const LongValue: Story = {
    args: {
        label: 'Bemerkung',
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        useSmallLabel: false,
    },
};

export const Form: Story = {
    render: () => ({
        template: `
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <puibe-readonly-label-value label="Vorname">Anna</puibe-readonly-label-value>
            <puibe-readonly-label-value label="Nachname">Muster</puibe-readonly-label-value>
            <puibe-readonly-label-value label="Geburtsdatum">14.03.1985</puibe-readonly-label-value>
            <puibe-readonly-label-value label="Gemeinde">Bern</puibe-readonly-label-value>
        </div>`,
    }),
};
