import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PuibeTooltipButtonComponent } from './tooltip.component';

type Args = {
    text: string;
    overlayMaxWidthClass: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/tooltip',
    component: PuibeTooltipButtonComponent,
    tags: ['autodocs'],
    argTypes: {
        text: { type: 'string' },
        overlayMaxWidthClass: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuibeTooltipButtonComponent],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `
        <div class="p-40">
            <p>
                Die AHV-Nummer finden Sie auf Ihrer Krankenkassenkarte
                <puibe-tooltip-button [overlayMaxWidthClass]="overlayMaxWidthClass">{{ text }}</puibe-tooltip-button>
            </p>
        </div>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: {
        text: 'Die AHV-Nummer ist 13-stellig und beginnt mit 756.',
        overlayMaxWidthClass: 'max-w-md',
    },
};

export const LongText: Story = {
    args: {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        overlayMaxWidthClass: 'max-w-xs',
    },
};
