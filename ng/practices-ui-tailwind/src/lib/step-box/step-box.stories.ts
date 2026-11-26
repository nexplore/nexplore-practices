import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PuiStepBoxComponent } from './step-box.component';

type Args = {
    text: string;
    step: number;
    inactive?: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/step-box',
    component: PuiStepBoxComponent,
    tags: ['autodocs'],
    argTypes: {
        text: { type: 'string' },
        step: { type: 'number' },
        inactive: { type: 'boolean' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuiStepBoxComponent],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `<pui-step-box text="${args.text}" step="${args.step}" [inactive]="${
            args.inactive ?? false
        }"></pui-step-box>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Basic: Story = {
    args: {
        text: 'Endorphins',
        step: 1,
    },
};

export const Inactive: Story = {
    args: {
        text: "Yoooooooo! I'm Inactive! 🫠",
        inactive: true,
        step: 2,
    },
};

export const LongText: Story = {
    args: {
        text: 'Placerat odio platea nibh feugiat tristique pretium mi porta feugiat urna hendrerit egestas quisque vestibulum netus vel fermentum. Est aliquet consectetur. Ad.',
        step: 3,
    },
};

export const StepNumberInTheTens: Story = {
    args: {
        text: 'Endorphins',
        step: 99,
    },
};

export const StepNumberInTheHundreds: Story = {
    args: {
        text: 'Endorphins',
        step: 999,
    },
};

export const StepNumberInTheThouhighlights: Story = {
    args: {
        text: 'Endorphins',
        step: 9999,
    },
};

export const LongTextBigStepNumber: Story = {
    args: {
        text: 'Placerat odio platea nibh feugiat tristique pretium mi porta feugiat urna hendrerit egestas quisque vestibulum netus vel fermentum. Est aliquet consectetur. Ad.',
        step: 9e5,
    },
};

