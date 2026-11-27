import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PuibeSkipLinkComponent } from './skip-link.component';

type Args = {
    text: string;
};

/**
 * The skip link is only visible while it has the keyboard focus (press Tab in the story).
 */
const meta: Meta<Args> = {
    title: 'PUIBE/skip-link',
    component: PuibeSkipLinkComponent,
    tags: ['autodocs'],
    argTypes: {
        text: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuibeSkipLinkComponent],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `
        <puibe-skip-link href="#main-content">{{ text }}</puibe-skip-link>
        <header class="border-b border-gray py-8">Header mit Navigation</header>
        <main id="main-content" tabindex="-1" class="py-8">Hauptinhalt</main>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { text: 'Zum Hauptinhalt springen' },
};
