import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiInpageSearchComponent } from './inpage-search.component';

type Args = {
    placeholder?: string;
    label?: string;
    pending?: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/inpage-search',
    component: PuiInpageSearchComponent,
    tags: ['autodocs'],
    argTypes: { placeholder: { type: 'string' }, label: { type: 'string' }, pending: { type: 'boolean' } },
    decorators: [
        moduleMetadata({
            imports: [PuiInpageSearchComponent, BrowserAnimationsModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-inpage-search [placeholder]="placeholder" [pending]="pending" [label]="label"></pui-inpage-search>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const SearchboxDefault: Story = {
    args: {},
};

export const SearchboxWithCutomPlaceholder: Story = {
    args: {
        placeholder: 'Gesamte Seite durchsuchen...',
        label: 'Seite durchsuchen',
    },
};

export const SearchboxPendig: Story = {
    args: {
        pending: true,
    },
};

