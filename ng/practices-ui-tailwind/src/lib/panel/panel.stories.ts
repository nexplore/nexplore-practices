import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiPanelComponent } from './panel.component';

type Args = {
    heading?: string;
    headingLevel?: number;
    caption?: string;
    addItemPadding?: boolean;
    variant?: 'highlight' | 'white';
};

const meta: Meta<Args> = {
    title: 'PUIBE/panel',
    component: PuiPanelComponent,
    tags: ['autodocs'],
    argTypes: {
        heading: { type: 'string' },
        headingLevel: { type: 'number', defaultValue: 2 },
        caption: { type: 'string' },
        addItemPadding: { type: 'boolean', defaultValue: true },
        variant: { type: { name: 'enum', value: ['highlight', 'white'] }, defaultValue: 'highlight' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuiPanelComponent],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-panel class="w-3/4" [heading]="heading" [headingLevel]="headingLevel" [caption]="caption" [variant]="variant" [addItemPadding]="addItemPadding">
            <span>Test Content</span>
        </pui-panel>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const HighlightPanel: Story = {
    args: {
        heading: 'Title Level 2',
        variant: 'highlight',
        headingLevel: 2,
        addItemPadding: true,
    },
};

export const WhitePanel: Story = {
    args: {
        heading: 'Title Level 2',
        variant: 'white',
        headingLevel: 2,
        addItemPadding: true,
    },
};

export const PanelCaption: Story = {
    args: {
        heading: 'Title Level 2',
        caption: 'This is a caption',
        variant: 'highlight',
        headingLevel: 2,
        addItemPadding: true,
    },
};

export const CustomHeadingLevel: Story = {
    args: {
        heading: 'Title Level 4',
        variant: 'highlight',
        headingLevel: 4,
        addItemPadding: true,
    },
};

export const WithoutContentPadding: Story = {
    args: {
        heading: 'Title Level 2',
        variant: 'highlight',
        headingLevel: 2,
        addItemPadding: false,
    },
};

