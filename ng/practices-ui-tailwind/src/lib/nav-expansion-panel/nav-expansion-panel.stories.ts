import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiNavExpansionPanelComponent } from './nav-expansion-panel.component';

type Args = {
    heading?: PuiNavExpansionPanelComponent['heading'];
    navigationHeadings?: PuiNavExpansionPanelComponent['navigationHeadings'];
};

const meta: Meta<Args> = {
    title: 'PUIBE/nav-expansion-panel',
    component: PuiNavExpansionPanelComponent,
    tags: ['autodocs'],
    argTypes: {
        heading: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuiNavExpansionPanelComponent, BrowserAnimationsModule],
        }),
    ],

    render: (args) => ({
        props: {
            ...args,
        },
        template: `<pui-nav-expansion-panel 
            class="relative w-1/3 left-1/3 " 
            [heading]="heading" 
            [navigationHeadings]="navigationHeadings"></pui-nav-expansion-panel>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const NavExpansionPanel: Story = {
    args: {
        heading: 'Content',
        navigationHeadings: [
            'Heading 1',
            'Heading 2',
            'Heading 3',
            'This, ladies and gentlemen, is a very long heading. So long in fact, that it probably requires a line break to be fully visible.',
        ],
    },
};

export const EmptyNavExpansionPanel: Story = {
    args: {
        heading: 'Content',
        navigationHeadings: [],
    },
};

