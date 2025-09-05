import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeTabsComponent, PuibeTabSelectionItem } from './tabs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';

type Args = {
    items: Array<PuibeTabSelectionItem>;
    selectedItemId?: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/tabs',
    component: PuibeTabsComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuibeTabsComponent, BrowserAnimationsModule, RouterTestingModule, NgSelectModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-tabs [items]="items" [selectedItemId]="selectedItemId">
        </puibe-tabs>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const tabsDefaultStory: Story = {
    args: {
        items: [
            { label: 'Lorem Ipsum', id: '1' },
            { label: 'Dolor sit amet', id: '2' },
            { label: 'consectetur adipiscing elit', id: '3' },
        ],
    },
};

export const tabsWithPreselectedItemStory: Story = {
    args: {
        items: [
            { label: 'Lorem Ipsum', id: '1' },
            { label: 'Dolor sit amet', id: '2' },
            { label: 'consectetur adipiscing elit', id: '3' },
        ],
        selectedItemId: '3',
    },
};
