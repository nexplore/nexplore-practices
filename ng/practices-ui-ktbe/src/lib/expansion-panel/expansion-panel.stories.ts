import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeExpansionPanelComponent } from './expansion-panel.component';
import { PuibeIconEditComponent } from '../icons/icon-edit.component';
import { PuibeIconInvalidComponent } from '../icons/icon-invalid.component';

type Args = {
    heading?: string;
    headingLevel?: number;
    caption?: string;
    useHeadingAfter?: boolean;
    useArrowBefore?: boolean;
    isExpanded?: boolean;
    addItemPadding?: boolean;
    variant?: 'sand' | 'white' | 'red';
    disableScrollIntoView?: boolean;
    enableContentScroll?: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/expansion-panel',
    component: PuibeExpansionPanelComponent,
    tags: ['autodocs'],
    argTypes: {
        heading: { type: 'string' },
        headingLevel: { type: 'number', defaultValue: 2 },
        useHeadingAfter: { type: 'boolean', defaultValue: false },
        useArrowBefore: { type: 'boolean', defaultValue: false },
        isExpanded: { type: 'boolean', defaultValue: false },
        addItemPadding: { type: 'boolean', defaultValue: true },
        enableContentScroll: { type: 'boolean', defaultValue: false },
        variant: { type: { name: 'enum', value: ['sand', 'white', 'red'] }, defaultValue: 'sand' },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeExpansionPanelComponent,
                BrowserAnimationsModule,
                PuibeIconInvalidComponent,
                PuibeIconEditComponent,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-expansion-panel class="w-3/4" [heading]="heading" [disableScrollIntoView]="disableScrollIntoView" [enableContentScroll]="enableContentScroll" [headingLevel]="headingLevel" [caption]="caption" [isExpanded]="isExpanded" [variant]="variant" [addItemPadding]="addItemPadding">
            <span>Test Content</span>
            ${
                args.useHeadingAfter
                    ? '<a href="http://www.google.ch" target="_blank" slot="heading-after"><puibe-icon-edit class="w-[1.5em] inline-block translate-y-1"></puibe-icon-edit></a>'
                    : ''
            }
            ${
                args.useArrowBefore
                    ? '<puibe-icon-invalid class="h-6 w-6 block" slot="arrow-before"></puibe-icon-invalid>'
                    : ''
            }
        </puibe-expansion-panel>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const ExpandedAccordionTitleLevel2SandVariation: Story = {
    args: {
        heading: 'Title Level 2: This is a very long title causing a linebreak in the titel of an Expansionpanel',
        headingLevel: 2,
        isExpanded: true,
        addItemPadding: true,
        variant: 'sand',
    },
};

export const ExpandedAccordionTitleLevel2SandVariationWithCaption: Story = {
    args: {
        heading: 'Title Level 2',
        headingLevel: 2,
        caption: 'A small caption',
        isExpanded: true,
        addItemPadding: true,
        variant: 'sand',
    },
};

export const ExpandedAccordionTitleLevel2SandVariationWithCustomSlots: Story = {
    args: {
        heading: 'Title Level 2',
        headingLevel: 2,
        useHeadingAfter: true,
        useArrowBefore: true,
        isExpanded: true,
        addItemPadding: true,
        variant: 'sand',
    },
};

export const ClosedAccordionTitleLevel3WhiteVariation: Story = {
    args: {
        heading: 'Title Level 3',
        headingLevel: 3,
        isExpanded: false,
        addItemPadding: true,
        variant: 'white',
    },
};

export const ExpandedAccordionTitleLevel3WhiteVariationWithoutItemPadding: Story = {
    args: {
        heading: 'Title Level 3',
        headingLevel: 3,
        isExpanded: true,
        addItemPadding: false,
        variant: 'white',
    },
};

export const ClosedAccordionTitleLevel4RedVariation: Story = {
    args: {
        heading: 'Title Level 4',
        headingLevel: 4,
        isExpanded: false,
        addItemPadding: true,
        variant: 'red',
    },
};

export const ExpandedAccordionTitleLevel4RedVariation: Story = {
    args: {
        heading: 'Title Level 4',
        headingLevel: 4,
        isExpanded: true,
        addItemPadding: true,
        variant: 'red',
    },
};

export const ScrollIntoView: Story = {
    args: {
        heading: 'Title Level 3',
        isExpanded: true,
        addItemPadding: false,
        variant: 'white',
    },
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <div class="h-screen overflow-auto">
        <puibe-expansion-panel class="w-3/4" [heading]="heading" [disableScrollIntoView]="false" [headingLevel]="headingLevel" [caption]="caption" [isExpanded]="isExpanded" [variant]="variant" [addItemPadding]="addItemPadding">
            <h1 class="bg-gray h-96">Test Content 1</h1>
        </puibe-expansion-panel>
        <puibe-expansion-panel class="w-3/4" [heading]="heading" [disableScrollIntoView]="false" [headingLevel]="headingLevel" [caption]="caption" [isExpanded]="isExpanded" [variant]="variant" [addItemPadding]="addItemPadding">
            <h1 class="bg-gray h-96">Test Content 2</h1>
        </puibe-expansion-panel>
        <puibe-expansion-panel class="w-3/4" [heading]="heading" [disableScrollIntoView]="false" [headingLevel]="headingLevel" [caption]="caption" [isExpanded]="isExpanded" [variant]="variant" [addItemPadding]="addItemPadding">
            <h1 class="bg-gray h-96">Test Content 3</h1>
        </puibe-expansion-panel>
        </div>
        `,
    }),
};
