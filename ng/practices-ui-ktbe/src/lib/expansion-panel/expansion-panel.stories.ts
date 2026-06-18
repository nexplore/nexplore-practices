import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeIconEditComponent } from '../icons/icon-edit.component';
import { PuibeIconInvalidComponent } from '../icons/icon-invalid.component';
import { PuibeExpansionPanelComponent } from './expansion-panel.component';

type Args = {
    heading?: string;
    headingLevel?: number;
    caption?: string;
    useHeadingBefore?: boolean;
    useHeadingAfter?: boolean;
    useCaptionAfter?: boolean;
    useArrowBefore?: boolean;
    isExpanded?: boolean;
    addItemPadding?: boolean;
    variant?: 'sand' | 'white' | 'red';
    disableScrollIntoView?: boolean;
    enableContentScroll?: boolean;
    truncateHeading?: boolean;
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
        useHeadingBefore: { type: 'boolean', defaultValue: false },
        useCaptionAfter: { type: 'boolean', defaultValue: false },
        isExpanded: { type: 'boolean', defaultValue: false },
        addItemPadding: { type: 'boolean', defaultValue: true },
        enableContentScroll: { type: 'boolean', defaultValue: false },
        variant: { type: { name: 'enum', value: ['sand', 'white', 'red'] }, defaultValue: 'sand' },
        truncateHeading: { type: 'boolean', defaultValue: false },
        caption: { type: 'string' },
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
        <puibe-expansion-panel class="w-3/4" [heading]="heading" [disableScrollIntoView]="disableScrollIntoView" [enableContentScroll]="enableContentScroll" [headingLevel]="headingLevel" [caption]="caption" [isExpanded]="isExpanded" [variant]="variant" [addItemPadding]="addItemPadding" [truncateHeading]="truncateHeading" [caption]="caption">
            <span>Test Content</span>
            ${
                args.useHeadingBefore
                    ? '<puibe-icon-invalid slot="heading-before" size="m" class="mr-4"></puibe-icon-invalid>'
                    : ''
            }
            ${
                args.useHeadingAfter
                    ? '<a href="http://www.google.ch" target="_blank" slot="heading-after"><puibe-icon-edit class="w-[1.5em] inline-block translate-y-1"></puibe-icon-edit></a>'
                    : ''
            }
            ${args.useCaptionAfter ? '<span slot="caption-after">Caption After</span>' : ''}
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

export const WithAllSlots: Story = {
    args: {
        heading: 'Heading',
        caption: 'A small caption',
        useHeadingBefore: true,
        useHeadingAfter: true,
        useCaptionAfter: true,
        useArrowBefore: true,
        isExpanded: false,
        addItemPadding: true,
        variant: 'white',
        disableScrollIntoView: false,
        enableContentScroll: false,
        truncateHeading: false,
    },
};

export const WithAllSlotNamesVisible: Story = {
    args: {
        heading: 'Heading',
        isExpanded: false,
        headingLevel: 2,
        variant: 'white',
        addItemPadding: false,
        truncateHeading: false,
        caption: 'Caption',
    },
    render: (args) => ({
        props: { ...args },
        template: `
            <puibe-expansion-panel
                class="w-full max-w-[800px]"
                [heading]="heading"
                [headingLevel]="headingLevel"
                [isExpanded]="isExpanded"
                [variant]="variant"
                [addItemPadding]="addItemPadding"
                [truncateHeading]="truncateHeading"
                [caption]="caption"
            >
                <span slot="heading-before" class="mr-4">heading-before</span>
                <span slot="heading-after">heading-after</span>
                <span slot="caption-after">caption-after</span>
                <span slot="arrow-before" class="whitespace-nowrap">arrow-before</span>

                <div>Inhalt des Expansion Panels</div>
            </puibe-expansion-panel>
        `,
    }),
};

export const WithLongHeadingWithoutTruncation: Story = {
    args: {
        ...WithAllSlots.args,
        heading:
            'Invoice-File-Name-This-Is-An-Extremely-Long-Heading-To-Verify-That-The-Expansion-Panel-Title-Can-Wrap-Correctly.pdf',
        truncateHeading: false,
    },
    render: WithAllSlots.render,
};

export const WithLongHeadingAndTruncation: Story = {
    args: {
        ...WithAllSlots.args,
        heading:
            'Invoice-File-Name-This-Is-An-Extremely-Long-Heading-To-Verify-That-The-Expansion-Panel-Title-Is-Truncated-Correctly.pdf',
        truncateHeading: true,
    },
    render: WithAllSlots.render,
};
