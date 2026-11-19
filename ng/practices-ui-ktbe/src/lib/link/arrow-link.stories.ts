import { provideRouter } from '@angular/router';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { PuibeArrowLinkComponent } from './arrow-link.component';

type Args = {
    label: string;
    routerLink: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/arrow-link',
    component: PuibeArrowLinkComponent,
    tags: ['autodocs'],
    argTypes: {
        label: { type: 'string' },
        routerLink: { type: 'string' },
    },
    decorators: [
        applicationConfig({ providers: [provideRouter([])] }),
        moduleMetadata({
            imports: [PuibeArrowLinkComponent],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `<puibe-arrow-link [label]="label" [routerLink]="routerLink"></puibe-arrow-link>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: { label: 'Zum Formular', routerLink: '/formular' },
};

export const List: Story = {
    render: () => ({
        template: `
        <div class="flex flex-col gap-4">
            <puibe-arrow-link label="Steuererklärung einreichen" routerLink="/steuern"></puibe-arrow-link>
            <puibe-arrow-link label="Adresse ändern" routerLink="/adresse"></puibe-arrow-link>
            <puibe-arrow-link label="Ein sehr langer Linktext, der auf kleinen Bildschirmen umbricht und trotzdem lesbar bleibt" routerLink="/lang"></puibe-arrow-link>
        </div>`,
    }),
};
