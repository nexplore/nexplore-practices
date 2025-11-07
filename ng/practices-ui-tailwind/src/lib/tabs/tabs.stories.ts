import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiTabsComponent, PuiTabSelectionItem } from './tabs.component';

type Args = {
    items: Array<PuiTabSelectionItem>;
    selectedItemId?: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/tabs',
    component: PuiTabsComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuiTabsComponent, BrowserAnimationsModule, RouterTestingModule, NgSelectModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-tabs [items]="items" [selectedItemId]="selectedItemId">
        </pui-tabs>`,
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

